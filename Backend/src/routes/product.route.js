const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller.js');
const { authenticate } = require('../middlewares/auth.middleware.js');
const { checkAdminRole } = require('../middlewares/checkRole.middleware.js');
const upload = require('../utils/upload.util.js');

// Rutas públicas
router.get('/', productController.getAllProducts);

// Middleware de autenticación aplicado solo a rutas específicas
router.use(authenticate);

// Subida de imágenes (simplificado y más robusto)
router.post('/upload', 
  (req, res, next) => {
    // Middleware para manejar errores de Multer
    upload.array('images', 5)(req, res, (err) => {
      if (err) {
        let errorMessage = "Error al subir imágenes";
        if (err.code === 'LIMIT_FILE_SIZE') {
          errorMessage = "El tamaño del archivo excede el límite permitido (5MB)";
        } else if (err.message.includes('file type')) {
          errorMessage = "Solo se permiten imágenes JPEG/PNG";
        }
        return res.status(400).json({ 
          success: false, 
          message: errorMessage,
          error: err.message 
        });
      }
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No se proporcionaron archivos para subir"
        });
      }
      
      next();
    });
  },
  productController.uploadProductImages
);

// Rutas solo para admin
router.use(checkAdminRole); // Aplica a todas las rutas siguientes
router.post('/', productController.createProduct);
router.patch('/:product_id', productController.updateProduct);
router.delete('/:product_id', productController.deleteProduct);

module.exports = router;