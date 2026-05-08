import AuthService from '../services/AuthService.js';
import Result from '../valueObjects/Result.js';

class AuthController {
  static async registrarUsuario(req, res, next) {
    try {
      const resultado = await AuthService.registrarUsuario(req.body);
      Result.created(resultado, 'Usuário registrado com sucesso').send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async registrarCantina(req, res, next) {
    try {
      const resultado = await AuthService.registrarCantina(req.body);
      Result.created(resultado, 'Cantina registrada com sucesso').send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async loginUsuario(req, res, next) {
    try {
      const { email, senha } = req.body;
      const resultado = await AuthService.loginUsuario(email, senha);
      Result.ok(resultado, 'Login realizado com sucesso').send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async loginCantina(req, res, next) {
    try {
      const { email, senha } = req.body;
      const resultado = await AuthService.loginCantina(email, senha);
      Result.ok(resultado, 'Login realizado com sucesso').send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async googleLogin(req, res, next) {
    try {
      const { idToken } = req.body;
      const resultado = await AuthService.googleLogin(idToken);
      Result.ok(resultado, 'Login com Google realizado com sucesso').send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async excluirConta(req, res, next) {
    try {
      const { senha } = req.body;
      const { id } = req.usuario;
      await AuthService.excluirConta(id, senha);
      Result.ok(null, 'Conta excluída com sucesso').send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async verificarEmail(req, res, next) {
    try {
      const { token } = req.query;
      const resultado = await AuthService.verificarEmail(token);
      Result.ok(resultado).send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async solicitarResetSenha(req, res, next) {
    try {
      const { email } = req.body;
      await AuthService.solicitarResetSenha(email);
      Result.ok(null, 'Se o email estiver cadastrado, você receberá as instruções em breve').send(res);
    } catch (erro) {
      next(erro);
    }
  }

  static async resetarSenha(req, res, next) {
    try {
      const { token, novaSenha } = req.body;
      const resultado = await AuthService.resetarSenha(token, novaSenha);
      Result.ok(resultado).send(res);
    } catch (erro) {
      next(erro);
    }
  }
}

export default AuthController;
