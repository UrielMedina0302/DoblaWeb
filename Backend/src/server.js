require('dotenv').config({ path: '.env' });
const express = require('express');
const cors = require('cors');
const path = require('path');
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
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-data','X-Request-Source','X-Bypass-Interceptor', 'x-user-id', 'x-user-role'],
  exposedHeaders: ['Content-Disposition'] // Para descargas de archivos
}));

app.use('/uploads/products', express.static(path.join(__dirname, 'uploads', 'products'), {
  setHeaders: (res, path) => {
    res.set('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    
    // Configuración de cache para imágenes
    if (path.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      res.set('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// Middleware para servir imágenes a través de API (proxy seguro)
app.get('/api/images/:filename', (req, res) => {
  const safePath = path.join(__dirname, 'uploads', 'products', path.basename(req.params.filename));
  
  // Verificar existencia del archivo
  if (!fs.existsSync(safePath)) {
    return res.status(404).json({ 
      success: false,
      message: 'Imagen no encontrada'
    });
  }

  // Verificar que es una imagen
  const mimeType = mime.lookup(safePath);
  if (!mimeType || !mimeType.startsWith('image/')) {
    return res.status(400).json({
      success: false,
      message: 'Tipo de archivo no permitido'
    });
  }

  // Enviar archivo con headers adecuados
  res.sendFile(safePath, {
    headers: {
      'Content-Type': mimeType,
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Access-Control-Allow-Origin': 'http://localhost:4200'
    }
  });
});
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


app.listen(app.get('port'), () => {
  console.log(`Server running on port ${app.get('port')}`);
});