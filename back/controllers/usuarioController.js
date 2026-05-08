import UsuarioService from '../services/UsuarioService.js';
import Result from '../valueObjects/Result.js';

class UsuarioController {
  static async obterTodos(req, res, next) {
    try {
      const usuarios = await UsuarioService.obterTodos();
      Result.ok(usuarios).send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async obterPorId(req, res, next) {
    try {
      const { id } = req.params;
      const usuario = await UsuarioService.obterPorId(id);
      Result.ok(usuario).send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async obterPorEmail(req, res, next) {
    try {
      const { email } = req.params;
      const usuario = await UsuarioService.obterPorEmail(email);
      Result.ok(usuario).send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async criar(req, res, next) {
    try {
      const usuarioCriado = await UsuarioService.criar(req.body);
      Result.created(usuarioCriado, 'Usuário criado com sucesso').send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const atualizado = await UsuarioService.atualizar(id, req.body, req.usuario);
      Result.ok(atualizado, 'Usuário atualizado com sucesso').send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async atualizarPorEmail(req, res, next) {
    try {
      const { email } = req.params;
      const atualizado = await UsuarioService.atualizarPorEmail(email, req.body);
      Result.ok(atualizado, 'Usuário atualizado com sucesso').send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async remover(req, res, next) {
    try {
      const { id } = req.params;
      await UsuarioService.remover(id, req.usuario);
      Result.ok(null, 'Usuário removido com sucesso').send(res);
    } catch (erro) {
      next(erro);
    }
  }
}

export default UsuarioController;
