import express from "express";
const router = express.Router();
import UsuarioController from "../controllers/usuarioController.js";

router.get("/", UsuarioController.obterTodos);

router.get("/email/:email", UsuarioController.obterPorEmail);

router.get("/:id", UsuarioController.obterPorId);

router.post("/", UsuarioController.criar);

router.put("/:id", UsuarioController.atualizar);

router.delete("/:id", UsuarioController.remover);

export default router;