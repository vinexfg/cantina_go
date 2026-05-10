import CantinaService from '../services/CantinaService.js';
import Result from '../valueObjects/Result.js';

class CantinaController {
  static async listar(req, res, next) {
    try {
      const cantinas = await CantinaService.listar();
      Result.ok(cantinas).send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async obterTodos(req, res, next) {
    try {
      const cantinas = await CantinaService.obterTodos();
      Result.ok(cantinas).send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async obterPorId(req, res, next) {
    try {
      const { id } = req.params;
      const cantina = await CantinaService.obterPorId(id, req.usuario);
      Result.ok(cantina).send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async criar(req, res, next) {
    try {
      const cantinaCriada = await CantinaService.criar(req.body);
      Result.created(cantinaCriada, 'Cantina criada com sucesso').send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const atualizado = await CantinaService.atualizar(id, req.body, req.usuario);
      Result.ok(atualizado, 'Cantina atualizada com sucesso').send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async remover(req, res, next) {
    try {
      const { id } = req.params;
      await CantinaService.remover(id, req.usuario);
      Result.ok(null, 'Cantina removida com sucesso').send(res);
    } catch (erro) {
      next(erro);
    }
  }
}

export default CantinaController;
