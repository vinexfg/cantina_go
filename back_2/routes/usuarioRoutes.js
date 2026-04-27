// Rotas para Usuários
import express from "express";
const router = express.Router();
import UsuarioController from "../controllers/usuarioController.js";

// POST /api/usuarios/login - Login de usuário
router.post("/login", UsuarioController.login);

// GET /api/usuarios - Listar todos
router.get("/", UsuarioController.obterTodos);

// GET /api/usuarios/:id - Buscar por ID
router.get("/:id", UsuarioController.obterPorId);

// GET /api/usuarios/email/:email - Buscar por email
router.get("/email/:email", UsuarioController.obterPorEmail);

// POST /api/usuarios - Criar usuário
router.post("/", UsuarioController.criar);

// PUT /api/usuarios/:id - Atualizar usuário
router.put("/:id", UsuarioController.atualizar);

// PUT /api/usuarios/email/:email - Atualizar por email
router.put("/email/:email", UsuarioController.atualizarPorEmail);

// DELETE /api/usuarios/:id - Remover usuário
router.delete("/:id", UsuarioController.remover);

export default router;
