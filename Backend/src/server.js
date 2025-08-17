require('dotenv').config({ path: '.env' });
const express = require('express');
const cors = require('cors');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const connectDB = require('./Database');
connectDB();

const app = express();
const jsonMiddleware = express.json();
app.use(express.urlencoded({ extended: true }));

// Settings
app.set('port', process.env.PORT || 3000);

// Middlewares
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-data','X-Request-Source','X-Bypass-Interceptor']
}));


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(helmet());
app.use(morgan('dev'));

// IMPORTANTE: Elimina el jsonMiddleware global
// Solo aplica express.json() a rutas específicas


// Routers
const productRouter = require('./routes/product.route');
const userRouter = require('./routes/user.route');
const authRouter = require('./routes/auth.route');

app.use('/api/product', productRouter); // Multer manejará FormData
app.use('/api/user', jsonMiddleware, userRouter); // Solo JSON
app.use('/api/auth', limiter, jsonMiddleware, authRouter); // Solo JSON

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Errores de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: err.errors
    });
  }
  
  // Errores de Multer
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: err.message || 'Archivo demasiado grande'
    });
  }
  
  // Otros errores
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(app.get('port'), () => {
  console.log(`Server running on port ${app.get('port')}`);
});