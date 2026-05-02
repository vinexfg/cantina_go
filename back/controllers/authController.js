import AuthService from '../services/AuthService.js';
import Result from '../valueObjects/Result.js';
import AppException from '../exceptions/AppException.js';

class AuthController {
  static async registrarUsuario(req, res) {
    try {
      const resultado = await AuthService.registrarUsuario(req.body);
      Result.created(resultado, 'Usuário registrado com sucesso').send(res);
    } catch (erro) {
      AuthController.tratarErro(erro, res);
    }
  }

  static async registrarCantina(req, res) {
    try {
      const resultado = await AuthService.registrarCantina(req.body);
      Result.created(resultado, 'Cantina registrada com sucesso').send(res);
    } catch (erro) {
      AuthController.tratarErro(erro, res);
    }
  }

  static async loginUsuario(req, res) {
    try {
      const { email, senha } = req.body;
      const resultado = await AuthService.loginUsuario(email, senha);
      Result.ok(resultado, 'Login realizado com sucesso').send(res);
    } catch (erro) {
      AuthController.tratarErro(erro, res);
    }
  }

  static async loginCantina(req, res) {
    try {
      const { email, senha } = req.body;
      const resultado = await AuthService.loginCantina(email, senha);
      Result.ok(resultado, 'Login realizado com sucesso').send(res);
    } catch (erro) {
      AuthController.tratarErro(erro, res);
    }
  }

  static async googleLogin(req, res) {
    try {
      const { idToken } = req.body;
      const resultado = await AuthService.googleLogin(idToken);
      Result.ok(resultado, 'Login com Google realizado com sucesso').send(res);
    } catch (erro) {
      AuthController.tratarErro(erro, res);
    }
  }

  static tratarErro(erro, res) {
    if (erro instanceof AppException) {
      return erro.toResult().send(res);
    }
    return Result.internalError(erro.message).send(res);
  }
}

export default AuthController;
