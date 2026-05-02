import UsuarioService from '../services/UsuarioService.js';
import Result from '../valueObjects/Result.js';
import AppException from '../exceptions/AppException.js';

class UsuarioController {
  static async obterTodos(req, res) {
    try {
      const usuarios = await UsuarioService.obterTodos();
      Result.ok(usuarios).send(res);
    } catch (erro) {
      UsuarioController.tratarErro(erro, res);
    }
  }

  static async obterPorId(req, res) {
    try {
      const { id } = req.params;
      const usuario = await UsuarioService.obterPorId(id);
      Result.ok(usuario).send(res);
    } catch (erro) {
      UsuarioController.tratarErro(erro, res);
    }
  }

  static async obterPorEmail(req, res) {
    try {
      const { email } = req.params;
      const usuario = await UsuarioService.obterPorEmail(email);
      Result.ok(usuario).send(res);
    } catch (erro) {
      UsuarioController.tratarErro(erro, res);
    }
  }

  static async criar(req, res) {
    try {
      const usuarioCriado = await UsuarioService.criar(req.body);
      Result.created(usuarioCriado, 'Usuário criado com sucesso').send(res);
    } catch (erro) {
      UsuarioController.tratarErro(erro, res);
    }
  }

  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const atualizado = await UsuarioService.atualizar(id, req.body);
      Result.ok(atualizado, 'Usuário atualizado com sucesso').send(res);
    } catch (erro) {
      UsuarioController.tratarErro(erro, res);
    }
  }

  static async atualizarPorEmail(req, res) {
    try {
      const { email } = req.params;
      const atualizado = await UsuarioService.atualizarPorEmail(email, req.body);
      Result.ok(atualizado, 'Usuário atualizado com sucesso').send(res);
    } catch (erro) {
      UsuarioController.tratarErro(erro, res);
    }
  }

  static async remover(req, res) {
    try {
      const { id } = req.params;
      await UsuarioService.remover(id);
      Result.ok(null, 'Usuário removido com sucesso').send(res);
    } catch (erro) {
      UsuarioController.tratarErro(erro, res);
    }
  }

  static tratarErro(erro, res) {
    if (erro instanceof AppException) {
      return erro.toResult().send(res);
    }
    return Result.internalError(erro.message).send(res);
  }
}

export default UsuarioController;