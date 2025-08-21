const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { checkAdminRole } = require('../middlewares/checkRole.middleware');
const { smartUpload, handleUploadErrors } = require('../utils/upload.util');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');

// Ruta para servir imágenes
router.get('/image/:filename', (req, res) => {
  const filename = req.params.filename;
  
  if (!filename || !filename.match(/^[a-zA-Z0-9\-_.]+\.(jpg|jpeg|png|gif|webp)$/i)) {
    return res.status(400).json({ 
      success: false,
      message: 'Nombre de archivo inválido o extensión no permitida'
    });
  }

  const filePath = path.join(__dirname, '../uploads/products', filename);
  
   if (!fs.existsSync(filePath)) {
    console.log('❌ Imagen no encontrada:', filename);
    return res.status(404).json({
      success: false,
      message: 'Imagen no encontrada'
    });
  }
   try {
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      return res.status(400).json({
        success: false,
        message: 'El recurso solicitado no es un archivo válido'
      });
    }
  } catch (error) {
    console.error('Error accediendo al archivo:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
  const mimeType = mime.lookup(filename) || 'application/octet-stream';
  
   res.set({
    'Content-Type': mimeType,
    'Access-Control-Allow-Origin': '*', // Permite cualquier origen
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, max-age=31536000', // 1 año de cache
    'X-Content-Type-Options': 'nosniff'
  });

  // Servir el archivo
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error enviando archivo:', err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error al servir la imagen'
        });
      }
    }
  });
});

// Rutas públicas
router.get('/', productController.getAllProducts);
router.get('/:product_id', productController.getProductById);

// Rutas protegidas
router.use(authenticate, checkAdminRole);

// Ruta para crear producto - ORDEN CORRECTO
router.post(
  '/',
  (req, res, next) => {
    console.log('🔍 Content-Type recibido:', req.headers['content-type']);
    console.log('🔍 Body antes de multer:', req.body);
    next();
  },
  smartUpload('images', 5),
  (req, res, next) => {
    console.log('✅ Body después de multer:', req.body);
    console.log('✅ Archivos procesados:', req.files ? req.files.length : 0);
    next();
  },
  handleUploadErrors,
  productController.createProduct
);

// Ruta para actualizar producto - también con multer
router.patch(
  '/:product_id',
  smartUpload('images', 5),
  handleUploadErrors,
  productController.updateProduct
);

// Ruta para eliminar producto
router.delete('/:product_id', productController.deleteProduct);

// Manejador de errores
router.use((err, req, res, next) => {
  console.error('Error en rutas de productos:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor'
  });
});

module.exports = router;