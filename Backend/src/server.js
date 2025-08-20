// server.js - VERSIÓN CORREGIDA
require('dotenv').config({ path: '.env' });
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const fs = require('fs');
const mime = require('mime-types');
const connectDB = require('./Database');
connectDB();

const app = express();

// ⚠️⚠️⚠️ DESCOMENTA ESTOS MIDDLEWARES ESENCIALES ⚠️⚠️⚠️
app.use(express.json()); // Para JSON
app.use(express.urlencoded({ extended: true })); // Para form-data

// Settings
app.set('port', process.env.PORT || 3000);

// Middlewares
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-data','X-Request-Source','X-Bypass-Interceptor', 'x-user-id', 'x-user-role'],
  exposedHeaders: ['Content-Disposition']
}));

app.use('/uploads/products', express.static(path.join(__dirname, 'uploads', 'products'), {
  setHeaders: (res, filePath) => {
    // Configuración CORS más permisiva para archivos estáticos
    res.set('Access-Control-Allow-Origin', '*'); // Cambiado a * para imágenes
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    
    // Configuración de cache para imágenes
    if (filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      res.set('Cache-Control', 'public, max-age=86400');
      res.set('X-Content-Type-Options', 'nosniff');
    }
  }
}));
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // IMPORTANTE: Permite CORS para recursos
}));
app.use(morgan('dev'));

// Routers
const productRouter = require('./routes/product.route');
const userRouter = require('./routes/user.route');
const authRouter = require('./routes/auth.route');

// Configuración de rutas (ya no necesitas express.json() específico aquí)
app.use('/api/product', productRouter);
app.use('/api/user', userRouter);
app.use('/api/auth', limiter, authRouter);

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('Error global:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor'
  });
});

// Ruta no encontrada
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

app.listen(app.get('port'), () => {
  console.log(`Server running on port ${app.get('port')}`);
});