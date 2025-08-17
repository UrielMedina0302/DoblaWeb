const User= require('../models/User.model'); // Importa el modelo de usuario
const crypto = require('crypto'); // Importa el módulo crypto para generar tokens de restablecimiento de contraseña
const sendEmail = require('../utils/email.util.js'); // Importa la función para enviar correos electrónicos
const { CreateSendToken} = require('../utils/auth.util.js'); // Importa la función para crear y enviar el token
const jwt = require ('jsonwebtoken')

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

// Modifica el método login para incluir todos los datos necesarios
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validar entrada
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        error: 'Email y contraseña son requeridos'
      });
    }

    // 2. Buscar usuario y verificar contraseña
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: 'error',
        error: 'Email o contraseña incorrectas'
      });
    }

    // 3. Generar token JWT con TODOS los datos necesarios
    const token = jwt.sign(
      {
        userId: user._id,  // Asegúrate de usar userId
        email: user.email,
        role: user.role,
        name: user.name    // Agrega cualquier dato adicional necesario
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '90d' }
    );

    // 4. Configurar cookie
    const cookieOptions = {
      expires: new Date(
        Date.now() + (process.env.JWT_COOKIE_EXPIRES || 90) * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    };

    // 5. Enviar respuesta
    res.cookie('jwt', token, cookieOptions);

    // Eliminar la contraseña del output
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name
        }
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      status: 'error',
      error: 'Error interno del servidor'
    });
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
    let user; // Declarar fuera del try para poder limpiar en catch
    
    try {
        console.log('[FORGOT_PASSWORD] Iniciando proceso con body:', req.body);

        // Validación de email
        if (!req.body?.email) {
            return res.status(400).json({
                status: 'error',
                message: 'Por favor proporcione un email válido'
            });
        }

        // Buscar usuario
         user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(200).json({
        status: 'success',
        message: 'Si el email existe, se enviará un enlace de recuperación'
      });
    }

        // Generar y guardar token
        const resetToken = user.createPasswordResetToken();
        
        // Guardar usuario (sin validar otros campos)
         try {
      await user.save({ validateBeforeSave: false });
    } catch (saveError) {
      console.error('Error al guardar, reintentando...', saveError);
      await user.save({ validateBeforeSave: false });
    }
        console.log('[FORGOT_PASSWORD] Token guardado en BD para:', user.email);

        // Enviar email
        const frontendResetURL = `http://localhost:4200/reset-password?token=${resetToken}`;
        await new sendEmail(user, frontendResetURL).sendPasswordReset();
        
        res.status(200).json({
            status: 'success',
            message: 'Enlace de recuperación enviado al email'
        });

    } catch (error) {
        console.error('[FORGOT_PASSWORD] Error crítico:', error);
        
        // Revertir cambios si hay error y el usuario existe
        if (user) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });
        }

        res.status(500).json({
            status: 'error',
            message: 'Error al procesar la solicitud'
        });
    }
};

// En tu controlador de backend (Node.js/Express)
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, passwordConfirm } = req.body;

    console.log('🔍 Token recibido:', token);
    
    // 1. Validación básica del token
    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_TOKEN',
        message: 'Token de recuperación inválido'
      });
    }

    // 2. Hashear el token
    const hashedToken = crypto.createHash('sha256')
      .update(token)
      .digest('hex');

    console.log('🔐 Token hasheado:', hashedToken);

    // 3. Buscar usuario con token válido (con timeout)
      const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      // Consulta adicional para diagnóstico
      const expiredUser = await User.findOne({
        passwordResetToken: hashedToken
      }).select('passwordResetExpires');
      
      return res.status(401).json({
        status: 'error',
        code: 'TOKEN_EXPIRED_OR_INVALID',
        message: 'El enlace de recuperación ha expirado o es inválido',
        details: {
          tokenLength: token.length,
          storedTokenExists: !!expiredUser,
          tokenExpired: expiredUser?.passwordResetExpires < Date.now(),
          currentTime: new Date()
        }
      });
    }

    // 4. Validar contraseñas
    if (password !== passwordConfirm) {
      return res.status(400).json({
        status: 'error',
        code: 'PASSWORD_MISMATCH',
        message: 'Las contraseñas no coinciden'
      });
    }

    // 5. Actualizar contraseña
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now();
    
    await user.save({ validateBeforeSave: false });

    console.log('✅ Contraseña actualizada para:', user.email);

    // 6. Responder inmediatamente
    res.status(200).json({
      status: 'success',
      message: '¡Contraseña actualizada correctamente!'
    });

  } catch (error) {
    console.error('❌ Error en resetPassword:', error);
    
    // Asegurar que siempre se envíe una respuesta
    res.status(500).json({
      status: 'error',
      message: 'Error interno al procesar la solicitud'
    });
  }
};