import CantinaService from '../services/CantinaService.js';
import Result from '../valueObjects/Result.js';
import AppException from '../exceptions/AppException.js';

class CantinaController {
  static async obterTodos(req, res) {
    try {
      const cantinas = await CantinaService.obterTodos();
      Result.ok(cantinas).send(res);
    } catch (erro) {
      CantinaController.tratarErro(erro, res);
    }
  }

  static async obterPorId(req, res) {
    try {
      const { id } = req.params;
      const cantina = await CantinaService.obterPorId(id);
      Result.ok(cantina).send(res);
    } catch (erro) {
      CantinaController.tratarErro(erro, res);
    }
  }

  static async obterPorEmail(req, res) {
    try {
      const { email } = req.params;
      const cantina = await CantinaService.obterPorEmail(email);
      Result.ok(cantina).send(res);
    } catch (erro) {
      CantinaController.tratarErro(erro, res);
    }
  }

  static async criar(req, res) {
    try {
      const cantinaCriada = await CantinaService.criar(req.body);
      Result.created(cantinaCriada, 'Cantina criada com sucesso').send(res);
    } catch (erro) {
      CantinaController.tratarErro(erro, res);
    }
  }

  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const atualizado = await CantinaService.atualizar(id, req.body);
      Result.ok(atualizado, 'Cantina atualizada com sucesso').send(res);
    } catch (erro) {
      CantinaController.tratarErro(erro, res);
    }
  }

  static async remover(req, res) {
    try {
      const { id } = req.params;
      await CantinaService.remover(id);
      Result.ok(null, 'Cantina removida com sucesso').send(res);
    } catch (erro) {
      CantinaController.tratarErro(erro, res);
    }
  }

  static tratarErro(erro, res) {
    if (erro instanceof AppException) {
      return erro.toResult().send(res);
    }
    return Result.internalError(erro.message).send(res);
  }
}

export default CantinaController;