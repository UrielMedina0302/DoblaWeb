const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { checkAdminRole } = require('../middlewares/checkRole.middleware');
const { smartUpload, handleUploadErrors } = require('../utils/upload.util');

const path = require('path');
const fs = require('fs');

// Nueva ruta para servir imágenes de productos
// Ruta optimizada para servir imágenes
router.get('/image/:filename', (req, res) => {
  const filename = req.params.filename;
  // Usa la misma constante UPLOAD_DIR que usas en Multer
  const filePath = path.join(UPLOAD_DIR, filename); // <- Cambio clave aquí
  
  // Validación de seguridad mejorada
  if (!filename.match(/^[\w-]+\.[a-zA-Z]{3,4}$/)) {
    return res.status(400).json({ 
      success: false,
      message: 'Nombre de archivo inválido'
    });
  }

  if (!fs.existsSync(filePath)) {
    // Opción 1: Servir imagen por defecto
    const defaultImage = path.join(UPLOAD_DIR, 'default.jpg');
    if (fs.existsSync(defaultImage)) {
      return res.sendFile(defaultImage);
    }
    // Opción 2: Devolver error
    return res.status(404).json({
      success: false,
      message: 'Imagen no encontrada'
    });
  }

  // Determinar tipo MIME dinámicamente
  const mimeType = mime.lookup(filename) || 'application/octet-stream';
  
  res.sendFile(filePath, {
    headers: {
      'Content-Type': mimeType,
      'Access-Control-Allow-Origin': '*', // O especifica tu dominio
      'Cache-Control': 'public, max-age=31536000' // 1 año de cache
    }
  });
});

// Middleware para respuestas consistentes
router.use((req, res, next) => {
  res.type('json');
  next();
});

// Rutas públicas
router.get('/', productController.getAllProducts);
router.get('/:product_id', productController.getProductById);

// Rutas protegidas
router.use(authenticate, checkAdminRole);

// Ruta para crear/actualizar producto (inteligente)
router.post(
  '/',
  smartUpload('images', 5),
  handleUploadErrors,
  productController.createProduct
);

// Ruta para actualizar datos del producto (sin imágenes)
router.patch(
  '/:product_id',
  express.json(),
  productController.updateProduct
);

// Ruta para eliminar producto
router.delete('/:product_id', productController.deleteProduct);

// Manejador de errores específico
router.use((err, req, res, next) => {
  console.error('Error en rutas de productos:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor'
  });
});

module.exports = router;