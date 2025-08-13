const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { checkAdminRole } = require('../middlewares/checkRole.middleware');
const { smartUpload, handleUploadErrors } = require('../utils/upload.util');

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