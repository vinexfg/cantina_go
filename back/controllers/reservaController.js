import ReservaService from '../services/ReservaService.js';
import Result from '../valueObjects/Result.js';
import AppException from '../exceptions/AppException.js';

class ReservaController {
  static async obterTodos(req, res) {
    try {
      const reservas = await ReservaService.obterTodos();
      Result.ok(reservas).send(res);
    } catch (erro) {
      ReservaController.tratarErro(erro, res);
    }
  }

  static async obterPorId(req, res) {
    try {
      const { id } = req.params;
      const reserva = await ReservaService.obterPorId(id);
      Result.ok(reserva).send(res);
    } catch (erro) {
      ReservaController.tratarErro(erro, res);
    }
  }

  static async obterPorCantina(req, res) {
    try {
      const { cantina_id } = req.params;
      const reservas = await ReservaService.obterPorCantina(cantina_id);
      Result.ok(reservas).send(res);
    } catch (erro) {
      ReservaController.tratarErro(erro, res);
    }
  }

  static async obterPorUsuario(req, res) {
    try {
      const { usuario_id } = req.params;
      const reservas = await ReservaService.obterPorUsuario(usuario_id);
      Result.ok(reservas).send(res);
    } catch (erro) {
      ReservaController.tratarErro(erro, res);
    }
  }

  static async criar(req, res) {
    try {
      const reservaCriada = await ReservaService.criar(req.body);
      Result.created(reservaCriada, 'Reserva criada com sucesso').send(res);
    } catch (erro) {
      ReservaController.tratarErro(erro, res);
    }
  }

  static async atualizarStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const resultado = await ReservaService.atualizarStatus(id, status);
      Result.ok(resultado, 'Status atualizado com sucesso').send(res);
    } catch (erro) {
      ReservaController.tratarErro(erro, res);
    }
  }

  static async remover(req, res) {
    try {
      const { id } = req.params;
      await ReservaService.remover(id);
      Result.ok(null, 'Reserva removida com sucesso').send(res);
    } catch (erro) {
      ReservaController.tratarErro(erro, res);
    }
  }

  static tratarErro(erro, res) {
    if (erro instanceof AppException) {
      return erro.toResult().send(res);
    }
    return Result.internalError(erro.message).send(res);
  }
}

export default ReservaController;
