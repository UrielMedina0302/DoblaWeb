const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller.js');

// Rutas para manejar productos
router.post('/insert', productController.createProduct); // Ruta para crear un nuevo producto  
router.get('/getAll', productController.getAllProducts); // Ruta para obtener todos los productos
router.post('/updateOne/:product_id', productController.updateProduct); // Ruta para actualizar un producto por ID
router.post('/deleteOne/:product_id', productController.deleteProduct); // Ruta para eliminar un producto por ID
module.exports = router; // Exportar el router para usarlo en la aplicación principal
// Este archivo define las rutas relacionadas con los productos y las vincula a sus respectivos controladores
