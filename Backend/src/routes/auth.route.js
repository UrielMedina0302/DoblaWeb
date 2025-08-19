const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/signup', authController.signup);
router.post('/login', authController.login); 
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.post('/request-employee-code', authController.requestEmployeeCode); 
router.post('/approve-employee-code', authController.approveEmployeeCode);
// Ruta protegida 
router.use(authMiddleware.authenticate);
router.get('/userinfo', authController.getCurrentUser);
router.post('/logout', authController.logout);
module.exports = router;
