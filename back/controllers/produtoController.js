import ProdutoService from '../services/ProdutoService.js';
import Result from '../valueObjects/Result.js';
import AppException from '../exceptions/AppException.js';

class ProdutoController {
  static async obterTodos(req, res) {
    try {
      const produtos = await ProdutoService.obterTodos();
      Result.ok(produtos).send(res);
    } catch (erro) {
      ProdutoController.tratarErro(erro, res);
    }
  }

  static async obterPorId(req, res) {
    try {
      const { id } = req.params;
      const produto = await ProdutoService.obterPorId(id);
      Result.ok(produto).send(res);
    } catch (erro) {
      ProdutoController.tratarErro(erro, res);
    }
  }

  static async obterDisponiveis(req, res) {
    try {
      const produtos = await ProdutoService.obterDisponiveis();
      Result.ok(produtos).send(res);
    } catch (erro) {
      ProdutoController.tratarErro(erro, res);
    }
  }

  static async obterPorCantina(req, res) {
    try {
      const { cantina_id } = req.params;
      const produtos = await ProdutoService.obterPorCantina(cantina_id);
      Result.ok(produtos).send(res);
    } catch (erro) {
      ProdutoController.tratarErro(erro, res);
    }
  }

  static async criar(req, res) {
    try {
      const produtoCriado = await ProdutoService.criar(req.body);
      Result.created(produtoCriado, 'Produto criado com sucesso').send(res);
    } catch (erro) {
      ProdutoController.tratarErro(erro, res);
    }
  }

  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const atualizado = await ProdutoService.atualizar(id, req.body);
      Result.ok(atualizado, 'Produto atualizado com sucesso').send(res);
    } catch (erro) {
      ProdutoController.tratarErro(erro, res);
    }
  }

  static async remover(req, res) {
    try {
      const { id } = req.params;
      await ProdutoService.remover(id);
      Result.ok(null, 'Produto removido com sucesso').send(res);
    } catch (erro) {
      ProdutoController.tratarErro(erro, res);
    }
  }

  static tratarErro(erro, res) {
    if (erro instanceof AppException) {
      return erro.toResult().send(res);
    }
    return Result.internalError(erro.message).send(res);
  }
}

export default ProdutoController;