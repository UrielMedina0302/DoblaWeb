const User= require('../models/User.model'); // Importa el modelo de usuario
const crypto = require('crypto'); // Importa el módulo crypto para generar tokens de restablecimiento de contraseña
const sendEmail = require('../utils/email.util.js'); // Importa la función para enviar correos electrónicos
const { CreateSendToken} = require('../utils/auth.util.js'); // Importa la función para crear y enviar el token
exports.signup = async (req, res, next) => {// Controlador para registrar un nuevo usuario
    try {
        const { name, lastname, email, password, passwordConfirm } = req.body; // Extrae los datos del cuerpo de la solicitud
        // Validación de datos
        if (!name || !lastname || !email || !password) {
            return res.status(400).json({ 
                error: 'Todos los campos son obligatorios' 
            }); // Responde con un error si faltan datos
        }

        //Paso 1: Crea al nuevo usuario
        const newUser= await User.create({ // Crea un nuevo usuario con los datos proporcionados
        name,
        lastname,
        email,
        password,
        role:'user' // Asigna el rol de usuario por defecto
        });
        //Paso 2: Genera el token de autenticación
        CreateSendToken(newUser, 201, res); // Llama a la función para crear y enviar el token de autenticación
    } catch (error) {
        // Manejo de errores
        if (error.code === 11000) { // Verifica si el error es por duplicado
            return res.status(400).json({
                status: 'error', 
                message: 'El correo electrónico ya está en uso' 
            }); // Responde con un error si el correo ya existe
        }
        next(error); // Pasa el error al siguiente middleware de manejo de errores
    }
}

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    //Verificar que el email y la contraseña existen
    if (!email || !password) {
        return res.status(400).json({ 
            status: 'error',
            error: 'Email y contraseña son requeridos' });
        }

    // Buscar al usuario por email y verificar la contraseña
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Email o contraseña incorrectas' });
    }

    //const token = user.generateAuthToken();// Generar el token de autenticación
    CreateSendToken(user, 200, res); // Llama a la función para crear y enviar el token de autenticación
    // Enviar token en la respuesta (no en cookies)
    res.json({ 
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
    //Si todo esta bien, se envia token al cliente
    CreateSendToken(user, 200, res); // Llama a la función para crear y enviar el token de autenticación
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener usuario actual (GET)
exports.getCurrentUser = async (req, res) => {
  try {
    // El usuario ya está adjuntado por el middleware
    const user = await User.findById(req.user.id).select('-password');
    res.json({ 
        success: true, 
        user 
    });
  } catch (error) {
    res.status(500)
    .json({
         error: error.message 
        });
  }
};

// Logout (POST)
exports.logout = (req, res) => {
    // 1. Eliminar cookie del token
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000), // Expira en 10 segundos
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
  res.json({ 
    success: true, 
    message: 'Sesión cerrada exitosamente'
 });
};

exports.forgotPassword = async (req, res, next) => {
  try {
    // Validación mejorada del email
    if (!req.body?.email) {
      return res.status(400).json({
        status: 'error',
        message: 'Por favor proporcione un email válido'
      });
    }

    const user = await User.findOne({ email: req.body.email });
    
    // Respuesta genérica por seguridad
    if (!user) {
      return res.status(200).json({
        status: 'success',
        message: 'Si el email existe, se enviará un enlace de recuperación'
      });
    }

    // Generar token de reset
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // URL de reset (temporalmente al backend)
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;

    try {
      // Envío de email mejorado
      await new sendEmail(user, resetURL).sendPasswordReset();
      
      res.status(200).json({
        status: 'success',
        message: 'Enlace de recuperación enviado al email'
      });
    } catch (err) {
      // Limpiar token en caso de error
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('Error al enviar email:', err); // Log para diagnóstico
      
      return res.status(500).json({
        status: 'error',
        message: 'Error al enviar el email. Por favor intente nuevamente más tarde.'
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Validación mejorada
    if (!token) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Token de recuperación es requerido' 
      });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ 
        status: 'error',
        message: 'La contraseña debe tener al menos 8 caracteres' 
      });
    }

    // Hash del token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Buscar usuario con token válido
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        status: 'error',
        message: 'El token es inválido o ha expirado. Por favor solicite un nuevo enlace.' 
      });
    }

    // Actualizar contraseña
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Iniciar sesión automáticamente al usuario
    createSendToken(user, 200, res);
    
  } catch (error) {
    console.error('Error en resetPassword:', error); // Log para diagnóstico
    next(error);
  }
};