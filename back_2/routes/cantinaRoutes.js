// Rotas para Cantinas
import express from "express";
const router = express.Router();
import CantinaController from "../controllers/cantinaController.js";

// GET /api/cantinas - Listar todas
router.get("/", CantinaController.obterTodos);

// GET /api/cantinas/:id - Buscar por ID
router.get("/:id", CantinaController.obterPorId);

// GET /api/cantinas/email/:email - Buscar por email
router.get("/email/:email", CantinaController.obterPorEmail);

// POST /api/cantinas - Criar cantina
router.post("/", CantinaController.criar);

// PUT /api/cantinas/:id - Atualizar cantina
router.put("/:id", CantinaController.atualizar);

// DELETE /api/cantinas/:id - Remover cantina
router.delete("/:id", CantinaController.remover);

export default router;
