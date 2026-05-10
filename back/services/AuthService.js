import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import UsuarioRepository from '../repositories/UsuarioRepository.js';
import CantinaRepository from '../repositories/CantinaRepository.js';
import ReservaRepository from '../repositories/ReservaRepository.js';
import UsuarioService from './UsuarioService.js';
import CantinaService from './CantinaService.js';
import EmailService from './EmailService.js';
import ValidationException from '../exceptions/ValidationException.js';
import NotFoundException from '../exceptions/NotFoundException.js';
import Id from '../valueObjects/Id.js';

const TOKEN_RESET_EXPIRA_MS = 60 * 60 * 1000;

// LIMITAÇÃO: loginAttempts é armazenado em memória e é perdido ao reiniciar o processo.
// Em produção com múltiplas instâncias ou reinicializações frequentes, substituir por Redis ou tabela no banco.
const loginAttempts = new Map(); // email -> { count, lockedUntil }
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

class AuthService {
  async registrarUsuario(dados) {
    const usuario = await UsuarioService.criar(dados);
    const token = AuthService.gerarToken({ id: usuario.id, email: usuario.email, tipo: 'usuario', token_version: 0 });

    const verToken = crypto.randomBytes(32).toString('hex');
    UsuarioRepository.setTokenVerificacao(usuario.id, verToken)
      .then(() => EmailService.enviarVerificacao(usuario.email, verToken))
      .catch(() => {});

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
    AuthService._checkLockout(email);

    const row = await repository.findByEmail(email);
    if (!row) {
      AuthService._recordFailedAttempt(email);
      throw new NotFoundException('Email ou senha inválidos');
    }

    const senhaCorreta = await bcrypt.compare(senha, row.senha);
    if (!senhaCorreta) {
      AuthService._recordFailedAttempt(email);
      throw new NotFoundException('Email ou senha inválidos');
    }

    AuthService._clearAttempts(email);
    return row;
  }

  async googleLogin(idToken) {
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new ValidationException('Login com Google não configurado no servidor');
    }
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name } = payload;

    let row = await UsuarioRepository.findByEmail(email);
    if (!row) {
      const senhaHash = await bcrypt.hash(new Id().toString(), 10);
      row = await UsuarioRepository.create({
        id: new Id().toString(),
        nome: name,
        email,
        senha: senhaHash,
      });
    }

    const token = AuthService.gerarToken({ id: row.id, email: row.email, tipo: 'usuario', token_version: row.token_version ?? 0 });
    return { token, usuario: { id: row.id, nome: row.nome, email: row.email } };
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

  static _checkLockout(email) {
    const entry = loginAttempts.get(email);
    if (!entry?.lockedUntil) return;
    if (Date.now() < entry.lockedUntil) {
      const remainingMin = Math.ceil((entry.lockedUntil - Date.now()) / 60000);
      throw new ValidationException(`Conta temporariamente bloqueada. Tente novamente em ${remainingMin} minuto(s)`);
    }
    loginAttempts.delete(email);
  }

  static _recordFailedAttempt(email) {
    const entry = loginAttempts.get(email) || { count: 0, lockedUntil: null };
    entry.count += 1;
    if (entry.count >= MAX_ATTEMPTS) {
      entry.lockedUntil = Date.now() + LOCKOUT_MS;
      entry.count = 0;
    }
    loginAttempts.set(email, entry);
  }

  static _clearAttempts(email) {
    loginAttempts.delete(email);
  }
}

export default new AuthService();
