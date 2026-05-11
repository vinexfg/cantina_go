import express from "express";
const router = express.Router();
import CantinaController from "../controllers/cantinaController.js";
import AuthMiddleware from "../middleware/AuthMiddleware.js";

router.get("/", CantinaController.listar);
router.get("/:id", CantinaController.obterPorId);
router.put("/:id", AuthMiddleware.verificar, CantinaController.atualizar);
router.delete("/:id", AuthMiddleware.verificar, CantinaController.remover);

export default router;
