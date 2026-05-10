import express from "express";
const router = express.Router();
import UsuarioController from "../controllers/usuarioController.js";

router.get("/:id", UsuarioController.obterPorId);
router.put("/:id", UsuarioController.atualizar);
router.delete("/:id", UsuarioController.remover);

export default router;
