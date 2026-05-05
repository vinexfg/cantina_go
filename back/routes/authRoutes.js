import express from 'express';
const router = express.Router();
import AuthController from '../controllers/authController.js';
import AuthMiddleware from '../middleware/AuthMiddleware.js';

router.post('/registro/usuario', AuthController.registrarUsuario);
router.post('/registro/cantina', AuthController.registrarCantina);
router.post('/login/usuario', AuthController.loginUsuario);
router.post('/login/cantina', AuthController.loginCantina);
router.post('/google', AuthController.googleLogin);
router.delete('/conta', AuthMiddleware.verificar, AuthController.excluirConta);

export default router;
