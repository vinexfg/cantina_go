// Controlador para Produtos
import produtoModel from "../models/produtoModel.js";

class ProdutoController {
  static obterTodos(req, res) {
    const produtos = produtoModel.obterTodos();
    res.json(produtos);
  }

  static obterPorId(req, res) {
    const { id } = req.params;
    const produto = produtoModel.obterPorId(id);
    if (produto) {
      res.json(produto);
    } else {
      res.status(404).json({ message: "Produto não encontrado" });
    }
  }

  static obterDisponiveis(req, res) {
    const produtos = produtoModel.obterDisponiveis();
    res.json(produtos);
  }

  static criar(req, res) {
    const novoProduto = req.body;
    const produtoCriado = produtoModel.criar(novoProduto);
    res.status(201).json(produtoCriado);
  }

  static atualizar(req, res) {
    const { id } = req.params;
    const atualizacoes = req.body;
    const produtoAtualizado = produtoModel.atualizar(id, atualizacoes);
    if (produtoAtualizado) {
      res.json(produtoAtualizado);
    } else {
      res.status(404).json({ message: "Produto não encontrado" });
    }
  }

  static remover(req, res) {
    const { id } = req.params;
    const produtoRemovido = produtoModel.remover(id);
    if (produtoRemovido) {
      res.json({ message: "Produto removido", produto: produtoRemovido });
    } else {
      res.status(404).json({ message: "Produto não encontrado" });
    }
  }
}

export default ProdutoController;
