const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Rutas CRUD usando solo GET/POST
router.post('/users/create', authMiddleware.authenticate, userController.createUser);
router.post('/users/update', authMiddleware.authenticate, userController.updateUser);
router.get('/users/list', authMiddleware.authenticate, userController.getAllUsers);
router.get('/users/:id', authMiddleware.authenticate, userController.getUserById);
router.post('/users/delete', authMiddleware.authenticate, userController.deleteUser);

module.exports = router;