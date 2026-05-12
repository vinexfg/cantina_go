import express from 'express';
const router = express.Router();
import AuthController from '../controllers/authController.js';
import AuthMiddleware from '../middleware/AuthMiddleware.js';
import { loginLimiter, registroLimiter } from '../middleware/RateLimitMiddleware.js';
import { validar } from '../middleware/ValidationMiddleware.js';

const validarRegistro = validar({ nome: 'Nome é obrigatório', email: 'Email é obrigatório', senha: 'Senha é obrigatória' });
const validarLogin    = validar({ email: 'Email é obrigatório', senha: 'Senha é obrigatória' });

router.post('/registro/usuario', registroLimiter, validarRegistro, AuthController.registrarUsuario);
router.post('/registro/cantina', registroLimiter, validarRegistro, AuthController.registrarCantina);
router.post('/login/usuario',   loginLimiter,    validarLogin,    AuthController.loginUsuario);
router.post('/login/cantina',   loginLimiter,    validarLogin,    AuthController.loginCantina);
router.post('/google', loginLimiter, validar({ idToken: 'Token do Google é obrigatório' }), AuthController.googleLogin);
router.delete('/conta', AuthMiddleware.verificar, AuthController.excluirConta);
router.get('/verificar-email', AuthController.verificarEmail);
router.post('/reenviar-verificacao', loginLimiter, validar({ email: 'Email é obrigatório' }), AuthController.reenviarVerificacao);
router.post('/esqueci-senha', loginLimiter, validar({ email: 'Email é obrigatório' }), AuthController.solicitarResetSenha);
router.post('/resetar-senha', validar({ token: 'Token é obrigatório', novaSenha: 'Nova senha é obrigatória' }), AuthController.resetarSenha);

export default router;
