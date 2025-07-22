const jwt = require('jsonwebtoken');
const User = require('../models/User.model'); // Importa el modelo de usuario

exports.authenticate = async (req, res, next) => {
  try {
    // 1. Obtener token del cuerpo en POST o query en GET
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.body.token) {
            token = req.body.token;
        } else if (req.query.token) {
            token = req.query.token;
        }

    if (!token) {
      return res.status(401).json({ error: 'Inicia sesión para poder acceder' });
    }

    // 2. Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Obtener el usuario del token decodificado
     const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({
                status: 'error',
                message: 'El usuario ya no existe'
            });
        }

    // 4. Adjuntar usuario al request
    req.user = currentUser;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// Este middleware se encarga de autenticar al usuario mediante un token JWT, verificando su validez y adjuntando el usuario al objeto de solicitud.
exports.authorize = (...roles) => {
    return (req, res, next) => {
        //Paso 1: Verifica si el usuario tiene el rol adecuado
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'fail',
                message: 'No tienes permiso para realizar esta acción'
            }); // Responde con un error si el rol del usuario no está autorizado
        }
        next(); // Llama al siguiente middleware si el rol es válido
    };
}