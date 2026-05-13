import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UsuarioRepository from '../repositories/UsuarioRepository.js';
import CantinaRepository from '../repositories/CantinaRepository.js';
import LoginAttemptsRepository from '../repositories/LoginAttemptsRepository.js';
import ReservaRepository from '../repositories/ReservaRepository.js';
import UsuarioService from './UsuarioService.js';
import CantinaService from './CantinaService.js';
import EmailService from './EmailService.js';
import ValidationException from '../exceptions/ValidationException.js';
import NotFoundException from '../exceptions/NotFoundException.js';
import Id from '../valueObjects/Id.js';

const TOKEN_RESET_EXPIRA_MS = 60 * 60 * 1000;
const TOKEN_VERIFICACAO_EXPIRA_MS = 24 * 60 * 60 * 1000;

function gerarCodigoVerificacao() {
  return String(crypto.randomInt(100000, 1000000));
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

class AuthService {
  async registrarUsuario(dados) {
    const usuario = await UsuarioService.criar(dados);
    const token = AuthService.gerarToken({ id: usuario.id, email: usuario.email, tipo: 'usuario', token_version: 0 });

    const verToken = gerarCodigoVerificacao();
    const verExpira = new Date(Date.now() + TOKEN_VERIFICACAO_EXPIRA_MS);
    UsuarioRepository.setTokenVerificacao(usuario.id, verToken, verExpira)
      .then(() => EmailService.enviarVerificacao(usuario.email, verToken))
      .catch((err) => console.error('[Auth] Falha ao enviar email de verificacao:', err.message));

    return { token, usuario };
  }

  async registrarCantina(dados) {
    const cantina = await CantinaService.criar(dados);
    const token = AuthService.gerarToken({ id: cantina.id, email: cantina.email, tipo: 'cantina', token_version: 0 });
    return { token, cantina };
  }

  async loginUsuario(email, senha) {
    const row = await AuthService._autenticar(email, senha, UsuarioRepository, 'usuario');
    const token = AuthService.gerarToken({ id: row.id, email: row.email, tipo: 'usuario', token_version: row.token_version ?? 0 });
    return { token, usuario: { id: row.id, nome: row.nome, email: row.email } };
  }

  async loginCantina(email, senha) {
    const row = await AuthService._autenticar(email, senha, CantinaRepository, 'cantina');
    const token = AuthService.gerarToken({ id: row.id, email: row.email, tipo: 'cantina', token_version: row.token_version ?? 0 });
    return { token, cantina: { id: row.id, nome: row.nome, email: row.email } };
  }

  static async _autenticar(email, senha, repository, tipo) {
    AuthService.validarCredenciais(email, senha);
    await AuthService._checkLockout(email);

    const row = await repository.findByEmail(email);
    if (!row) {
      await AuthService._recordFailedAttempt(email);
      throw new NotFoundException('Email ou senha inválidos');
    }

    const senhaCorreta = await bcrypt.compare(senha, row.senha);
    if (!senhaCorreta) {
      await AuthService._recordFailedAttempt(email);
      throw new NotFoundException('Email ou senha inválidos');
    }

    if (tipo === 'usuario' && !row.email_verificado) {
      throw new ValidationException('E-mail não verificado. Verifique sua caixa de entrada e insira o código recebido.');
    }

    await AuthService._clearAttempts(email);
    return row;
  }

  async verificarEmail(token) {
    const row = await UsuarioRepository.findByTokenVerificacao(token);
    if (!row) throw new NotFoundException('Token inválido ou expirado');
    await UsuarioRepository.verificarEmail(row.id);
    return { message: 'Email verificado com sucesso' };
  }

  async solicitarResetSenha(email) {
    const row = await UsuarioRepository.findByEmail(email);
    if (!row) return; // não revelar se o email existe
    const token = crypto.randomBytes(32).toString('hex');
    const expira = new Date(Date.now() + TOKEN_RESET_EXPIRA_MS);
    await UsuarioRepository.setTokenReset(row.id, token, expira);
    await EmailService.enviarResetSenha(row.email, token);
  }

  async resetarSenha(token, novaSenha) {
    if (!novaSenha || novaSenha.length < 8) {
      throw new ValidationException('Senha deve ter pelo menos 8 caracteres');
    }
    const row = await UsuarioRepository.findByTokenReset(token);
    if (!row) throw new NotFoundException('Token inválido ou expirado');
    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await UsuarioRepository.updateSenha(row.id, senhaHash);
    await UsuarioRepository.incrementTokenVersion(row.id);
    await UsuarioRepository.limparTokenReset(row.id);
    return { message: 'Senha redefinida com sucesso' };
  }

  async reenviarVerificacao(email) {
    const row = await UsuarioRepository.findByEmail(email);
    if (!row || row.email_verificado) return;
    const verToken = gerarCodigoVerificacao();
    const verExpira = new Date(Date.now() + TOKEN_VERIFICACAO_EXPIRA_MS);
    await UsuarioRepository.setTokenVerificacao(row.id, verToken, verExpira);
    await EmailService.enviarVerificacao(row.email, verToken);
  }

  async excluirConta(id, senha) {
    if (!senha) throw new ValidationException('Senha é obrigatória para excluir a conta');

    const row = await UsuarioRepository.findById(id);
    if (!row) throw new NotFoundException('Usuário não encontrado');

    const senhaCorreta = await bcrypt.compare(senha, row.senha);
    if (!senhaCorreta) throw new ValidationException('Senha incorreta');

    await ReservaRepository.deleteAllByUsuario(id);
    await UsuarioRepository.delete(id);
  }

  static validarCredenciais(email, senha) {
    const erros = {};
    if (!email) erros.email = 'Email é obrigatório';
    if (!senha) erros.senha = 'Senha é obrigatória';
    if (Object.keys(erros).length > 0) {
      throw new ValidationException('Credenciais inválidas', erros);
    }
  }

  static gerarToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h'
    });
  }

  static async _checkLockout(email) {
    const lockedUntil = await LoginAttemptsRepository.checkLockout(email);
    if (!lockedUntil) return;
    const remainingMin = Math.ceil((lockedUntil - Date.now()) / 60000);
    throw new ValidationException(`Conta temporariamente bloqueada. Tente novamente em ${remainingMin} minuto(s)`);
  }

  static async _recordFailedAttempt(email) {
    await LoginAttemptsRepository.recordFailure(email, MAX_ATTEMPTS, LOCKOUT_MS);
  }

  static async _clearAttempts(email) {
    await LoginAttemptsRepository.clear(email);
  }
}

export default new AuthService();
