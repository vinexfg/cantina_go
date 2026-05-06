import ProdutoService from '../services/ProdutoService.js';
import Result from '../valueObjects/Result.js';

function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 50));
  return { page, limit };
}

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
      const { page, limit } = parsePagination(req.query);
      const { dados, total } = await ProdutoService.obterDisponiveis({ page, limit });
      Result.okPaginado(dados, { page, limit, total, totalPages: Math.ceil(total / limit) }).send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async obterPorCantina(req, res, next) {
    try {
      const { cantina_id } = req.params;
      const { page, limit } = parsePagination(req.query);
      const { dados, total } = await ProdutoService.obterPorCantina(cantina_id, { page, limit });
      Result.okPaginado(dados, { page, limit, total, totalPages: Math.ceil(total / limit) }).send(res);
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
