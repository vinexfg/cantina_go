import ReservaService from '../services/ReservaService.js';
import Result from '../valueObjects/Result.js';

class ReservaController {
  static async obterTodos(req, res, next) {
    try {
      const reservas = await ReservaService.obterTodos(req.usuario);
      Result.ok(reservas).send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async obterPorId(req, res, next) {
    try {
      const { id } = req.params;
      const reserva = await ReservaService.obterPorId(id, req.usuario);
      Result.ok(reserva).send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async obterPorCantina(req, res, next) {
    try {
      const { cantina_id } = req.params;
      const reservas = await ReservaService.obterPorCantina(cantina_id, req.usuario);
      Result.ok(reservas).send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async obterPorUsuario(req, res, next) {
    try {
      const { usuario_id } = req.params;
      const reservas = await ReservaService.obterPorUsuario(usuario_id, req.usuario);
      Result.ok(reservas).send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async criar(req, res, next) {
    try {
      const reservaCriada = await ReservaService.criar(req.body, req.usuario);
      Result.created(reservaCriada, 'Reserva criada com sucesso').send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async atualizarStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const resultado = await ReservaService.atualizarStatus(id, status, req.usuario);
      Result.ok(resultado, 'Status atualizado com sucesso').send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async historico(req, res, next) {
    try {
      const { cantina_id } = req.params;
      const reservas = await ReservaService.obterHistorico(cantina_id, req.usuario);
      Result.ok(reservas).send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async limparAntigas(req, res, next) {
    try {
      const resultado = await ReservaService.limparAntigas(req.usuario);
      Result.ok(resultado, 'Reservas antigas removidas').send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async limparAntigasUsuario(req, res, next) {
    try {
      const { usuario_id } = req.params;
      const resultado = await ReservaService.limparAntigasUsuario(usuario_id, req.usuario);
      Result.ok(resultado, 'Pedidos antigos removidos').send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async remover(req, res, next) {
    try {
      const { id } = req.params;
      await ReservaService.remover(id, req.usuario);
      Result.ok(null, 'Reserva removida com sucesso').send(res);
    } catch (erro) {
      next(erro);
    }
  }
}

export default ReservaController;
