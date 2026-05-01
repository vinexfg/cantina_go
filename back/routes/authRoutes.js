import express from 'express';
const router = express.Router();
import AuthController from '../controllers/authController.js';

// POST /api/auth/registro/usuario
router.post('/registro/usuario', AuthController.registrarUsuario);

// POST /api/auth/registro/cantina
router.post('/registro/cantina', AuthController.registrarCantina);

// POST /api/auth/login/usuario
router.post('/login/usuario', AuthController.loginUsuario);

// POST /api/auth/login/cantina
router.post('/login/cantina', AuthController.loginCantina);

// POST /api/auth/google
router.post('/google', AuthController.googleLogin);

export default router;
