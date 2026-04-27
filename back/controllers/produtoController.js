import produtoModel from "../models/produtoModel.js";

class ProdutoController {
  static async obterTodos(req, res) {
    const produtos = await produtoModel.obterTodos();
    res.json(produtos);
  }

  static async obterPorId(req, res) {
    const { id } = req.params;
    const produto = await produtoModel.obterPorId(id);

    if (produto) {
      res.json(produto);
    } else {
      res.status(404).json({ message: "Produto não encontrado" });
    }
  }

  static async obterDisponiveis(req, res) {
    const produtos = await produtoModel.obterDisponiveis();
    res.json(produtos);
  }

  static async criar(req, res) {
    const novoProduto = req.body;
    const produtoCriado = await produtoModel.criar(novoProduto);
    res.status(201).json(produtoCriado);
  }

  static async atualizar(req, res) {
    const { id } = req.params;
    const atualizacoes = req.body;

    const atualizado = await produtoModel.atualizar(id, atualizacoes);

    if (atualizado) {
      res.json({ message: "Produto atualizado" });
    } else {
      res.status(404).json({ message: "Produto não encontrado" });
    }
  }

  static async remover(req, res) {
    const { id } = req.params;

    const removido = await produtoModel.remover(id);

    if (removido) {
      res.json({ message: "Produto removido" });
    } else {
      res.status(404).json({ message: "Produto não encontrado" });
    }
  }
}

export default ProdutoController;