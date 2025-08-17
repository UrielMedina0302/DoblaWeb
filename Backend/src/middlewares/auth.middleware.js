const jwt = require('jsonwebtoken');
const User = require('../models/User.model'); // Importa el modelo de usuario


const publicRoutes = [
  { method: 'POST', path: '/api/auth/forgotPassword' },
  { method: 'POST', path: '/api/auth/login' },
  { method: 'POST', path: '/api/auth/signup' },
  { method: 'PATCH', path: /^\/api\/auth\/resetPassword\/.+/ }
];

exports.authenticate = async (req, res, next) => {
  // Verifica si es ruta pública
  const isPublic = publicRoutes.some(route => {
    const pathMatches = typeof route.path === 'string' 
      ? req.path === route.path 
      : route.path.test(req.path);
    return pathMatches && req.method === route.method;
  });

  if (isPublic) {
    console.log(`Accediendo a ruta pública: ${req.method} ${req.path}`);
    return next();
  }

  try {
    // Extraer token
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      console.log('No se encontró token en la solicitud');
      return res.status(401).json({ 
        status: 'error',
        message: 'Por favor inicie sesión para acceder',
        redirectToLogin: true
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findById(decoded.userId);
    
    if (!currentUser) {
      console.log('Usuario no encontrado para el token proporcionado');
      return res.status(401).json({
        status: 'error',
        message: 'El usuario asociado a este token ya no existe',
        redirectToLogin: true
      });
    }

    // Adjuntar usuario al request
    req.user = currentUser;
    console.log(`Usuario autenticado: ${currentUser.email}`);
    next();
  } catch (error) {
    console.error('Error en autenticación:', error.message);
    res.status(401).json({ 
      status: 'error',
      message: 'Sesión inválida o expirada',
      redirectToLogin: true
    });
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