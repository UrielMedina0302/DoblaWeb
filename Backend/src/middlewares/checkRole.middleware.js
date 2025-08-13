exports.checkAdminRole = (req, res, next) => {
  console.log('Datos del usuario en middleware:', {
    id: req.user?._id,
    email: req.user?.email,
    role: req.user?.role
  });

  if (!req.user) {
    console.error('Error: Usuario no autenticado');
    return res.status(401).json({ 
      success: false,
      message: 'Autenticación requerida' 
    });
  }

  const normalizedRole = req.user.role?.toString().toLowerCase().trim();
  
  if (normalizedRole !== 'admin') {
    console.error('Error: Rol no autorizado', {
      expected: 'admin',
      received: req.user.role,
      normalized: normalizedRole
    });
    return res.status(403).json({ 
      success: false, 
      message: 'Acceso denegado: se requiere rol de administrador',
      details: {
        userId: req.user._id,
        userRole: req.user.role
      }
    });
  }

  console.log('Acceso concedido a admin:', req.user.email);
  next();
};