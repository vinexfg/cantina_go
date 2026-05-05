import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import UsuarioRepository from '../repositories/UsuarioRepository.js';
import CantinaRepository from '../repositories/CantinaRepository.js';
import UsuarioService from './UsuarioService.js';
import CantinaService from './CantinaService.js';
import ValidationException from '../exceptions/ValidationException.js';
import NotFoundException from '../exceptions/NotFoundException.js';
import Id from '../valueObjects/Id.js';

class AuthService {
  async registrarUsuario(dados) {
    const usuario = await UsuarioService.criar(dados);
    const token = AuthService.gerarToken({ id: usuario.id, email: usuario.email, tipo: 'usuario' });
    return { token, usuario };
  }

  async registrarCantina(dados) {
    const cantina = await CantinaService.criar(dados);
    const token = AuthService.gerarToken({ id: cantina.id, email: cantina.email, tipo: 'cantina' });
    return { token, cantina };
  }

  async loginUsuario(email, senha) {
    AuthService.validarCredenciais(email, senha);

    const row = await UsuarioRepository.findByEmail(email);
    if (!row) throw new NotFoundException('Email ou senha inválidos');

    const senhaCorreta = await bcrypt.compare(senha, row.senha);
    if (!senhaCorreta) throw new NotFoundException('Email ou senha inválidos');

    const token = AuthService.gerarToken({ id: row.id, email: row.email, tipo: 'usuario' });
    return { token, usuario: { id: row.id, nome: row.nome, email: row.email } };
  }

  async loginCantina(email, senha) {
    AuthService.validarCredenciais(email, senha);

    const row = await CantinaRepository.findByEmail(email);
    if (!row) throw new NotFoundException('Email ou senha inválidos');

    const senhaCorreta = await bcrypt.compare(senha, row.senha);
    if (!senhaCorreta) throw new NotFoundException('Email ou senha inválidos');

    const token = AuthService.gerarToken({ id: row.id, email: row.email, tipo: 'cantina' });
    return { token, cantina: { id: row.id, nome: row.nome, email: row.email } };
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

    const token = AuthService.gerarToken({ id: row.id, email: row.email, tipo: 'usuario' });
    return { token, usuario: { id: row.id, nome: row.nome, email: row.email } };
  }

  async excluirConta(id, senha) {
    if (!senha) throw new ValidationException('Senha é obrigatória para excluir a conta');

    const row = await UsuarioRepository.findById(id);
    if (!row) throw new NotFoundException('Usuário não encontrado');

    const senhaCorreta = await bcrypt.compare(senha, row.senha);
    if (!senhaCorreta) throw new ValidationException('Senha incorreta');

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
}

export default new AuthService();
