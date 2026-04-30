import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UsuarioRepository from '../repositories/UsuarioRepository.js';
import CantinaRepository from '../repositories/CantinaRepository.js';
import UsuarioService from './UsuarioService.js';
import CantinaService from './CantinaService.js';
import ValidationException from '../exceptions/ValidationException.js';
import NotFoundException from '../exceptions/NotFoundException.js';

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
