exports.checkAdminRole = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Acceso denegado: se requiere rol de administrador' 
    });
  }
  next();
};