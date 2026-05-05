import ProdutoService from '../services/ProdutoService.js';
import Result from '../valueObjects/Result.js';

class ProdutoController {
  static async obterTodos(req, res, next) {
    try {
      const produtos = await ProdutoService.obterTodos();
      Result.ok(produtos).send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async obterPorId(req, res, next) {
    try {
      const { id } = req.params;
      const produto = await ProdutoService.obterPorId(id);
      Result.ok(produto).send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async obterDisponiveis(req, res, next) {
    try {
      const produtos = await ProdutoService.obterDisponiveis();
      Result.ok(produtos).send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async obterPorCantina(req, res, next) {
    try {
      const { cantina_id } = req.params;
      const produtos = await ProdutoService.obterPorCantina(cantina_id);
      Result.ok(produtos).send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async criar(req, res, next) {
    try {
      const produtoCriado = await ProdutoService.criar(req.body, req.usuario);
      Result.created(produtoCriado, 'Produto criado com sucesso').send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const atualizado = await ProdutoService.atualizar(id, req.body, req.usuario);
      Result.ok(atualizado, 'Produto atualizado com sucesso').send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async remover(req, res, next) {
    try {
      const { id } = req.params;
      await ProdutoService.remover(id, req.usuario);
      Result.ok(null, 'Produto removido com sucesso').send(res);
    } catch (erro) {
      next(erro);
    }
  }
}

export default ProdutoController;
