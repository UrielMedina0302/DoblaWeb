const jwt = require('jsonwebtoken');

const CreateSendToken = (user, statusCode, res) => {
    // 1. Verificar que JWT_SECRET existe
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET no está configurado en las variables de entorno');
  }

  // 2. Generar token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '10m'
  });

  // 3. Configurar opciones de cookie
  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 10) * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  // 4. Eliminar contraseña del output
  user.password = undefined;

  // 5. Enviar respuesta
  res.status(statusCode)
    .cookie('jwt', token, cookieOptions)
    .json({
      status: 'success',
      token,
      data: {
        user
      }
    });
};

module.exports = { CreateSendToken }; // Exporta la función para que pueda ser utilizada en otros módulos
// Esta función se encarga de crear y enviar el token de autenticación al cliente, junto
