const express = require ('express');
const router = express.Router();
const userController = require('../controllers/user.controller.js');

//Rutas para poder manerjar usuarios
router.post('/insert', userController.createUser); // Ruta para crear un nuevo usuario
router.get('/getAll', userController.getAllUsers); // Ruta para obtener todos los usuarios
router.get('/getOne/:user_id', userController.getUserById); // Ruta para obtener un usuario por ID
router.post('/updateOne/:user_id', userController.updateUser); // Ruta para actualizar un usuario por ID
router.post('/deleteOne/:user_id', userController.deleteUser); // Ruta para eliminar un usuario por ID
module.exports = router; // Exportar el router para usarlo en la aplicación principal

