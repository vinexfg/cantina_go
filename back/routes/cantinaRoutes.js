import express from "express";
const router = express.Router();
import CantinaController from "../controllers/cantinaController.js";

router.get("/:id", CantinaController.obterPorId);
router.put("/:id", CantinaController.atualizar);
router.delete("/:id", CantinaController.remover);

export default router;
