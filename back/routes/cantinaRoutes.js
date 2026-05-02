import express from "express";
const router = express.Router();
import CantinaController from "../controllers/cantinaController.js";

router.get("/", CantinaController.obterTodos);

router.get("/email/:email", CantinaController.obterPorEmail);

router.get("/:id", CantinaController.obterPorId);

// POST
router.post("/", CantinaController.criar);

// PUT
router.put("/:id", CantinaController.atualizar);

// DELETE
router.delete("/:id", CantinaController.remover);

export default router;