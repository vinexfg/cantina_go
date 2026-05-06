import ReservaService from '../services/ReservaService.js';
import Result from '../valueObjects/Result.js';

function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  return { page, limit };
}

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
      const { page, limit } = parsePagination(req.query);
      const { dados, total } = await ReservaService.obterPorCantina(cantina_id, req.usuario, { page, limit });
      Result.okPaginado(dados, { page, limit, total, totalPages: Math.ceil(total / limit) }).send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async obterPorUsuario(req, res, next) {
    try {
      const { usuario_id } = req.params;
      const { page, limit } = parsePagination(req.query);
      const { dados, total } = await ReservaService.obterPorUsuario(usuario_id, req.usuario, { page, limit });
      Result.okPaginado(dados, { page, limit, total, totalPages: Math.ceil(total / limit) }).send(res);
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
      const { page, limit } = parsePagination(req.query);
      const { dados, total } = await ReservaService.obterHistorico(cantina_id, req.usuario, { page, limit });
      Result.okPaginado(dados, { page, limit, total, totalPages: Math.ceil(total / limit) }).send(res);
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
