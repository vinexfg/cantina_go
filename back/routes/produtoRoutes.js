// Rotas para Produtos
import express from "express";
const router = express.Router();
import ProdutoController from "../controllers/produtoController.js";

// GET /api/produtos - Listar todos
router.get("/", ProdutoController.obterTodos);

// GET /api/produtos/disponiveis - Listar disponíveis
router.get("/disponiveis", ProdutoController.obterDisponiveis);

// GET /api/produtos/cantina/:cantina_id - Listar por cantina
router.get("/cantina/:cantina_id", ProdutoController.obterPorCantina);

// GET /api/produtos/:id - Buscar por ID
router.get("/:id", ProdutoController.obterPorId);

// POST /api/produtos - Criar produto
router.post("/", ProdutoController.criar);

// PUT /api/produtos/:id - Atualizar produto
router.put("/:id", ProdutoController.atualizar);

// DELETE /api/produtos/:id - Remover produto
router.delete("/:id", ProdutoController.remover);

export default router;
