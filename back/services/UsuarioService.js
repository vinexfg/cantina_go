import bcrypt from 'bcrypt';
import UsuarioRepository from '../repositories/UsuarioRepository.js';
import Usuario from '../valueObjects/Usuario.js';
import NotFoundException from '../exceptions/NotFoundException.js';
import ForbiddenException from '../exceptions/ForbiddenException.js';
import ValidationException from '../exceptions/ValidationException.js';

const SALT_ROUNDS = 10;

class UsuarioService {
  validarProprietario(usuarioAutenticado, usuario_id) {
    if (!usuarioAutenticado || usuarioAutenticado.tipo !== 'usuario' || String(usuarioAutenticado.id) !== String(usuario_id)) {
      throw new ForbiddenException('Acesso negado');
    }
  }

  async obterTodos() {
    const usuarios = await UsuarioRepository.findAll();
    return usuarios.map(row => Usuario.fromRow(row).toJSON());
  }

  async obterPorId(id) {
    const usuario = await UsuarioRepository.findById(id);
    if (!usuario) throw new NotFoundException('Usuário não encontrado');
    return Usuario.fromRow(usuario).toJSON();
  }

  async obterPorEmail(email) {
    const usuario = await UsuarioRepository.findByEmail(email);
    if (!usuario) throw new NotFoundException('Usuário não encontrado');
    return Usuario.fromRow(usuario).toJSON();
  }

  async criar(dados) {
    const usuario = Usuario.criar(dados);
    const senhaHash = await bcrypt.hash(usuario.senha, SALT_ROUNDS);
    const usuarioCriado = await UsuarioRepository.create({
      id: usuario.id.toString(),
      nome: usuario.nome,
      email: usuario.email.toString(),
      senha: senhaHash
    });
    return Usuario.fromRow(usuarioCriado).toJSON();
  }

  async atualizar(id, dados, usuarioAutenticado) {
    this.validarProprietario(usuarioAutenticado, id);
    const registro = await UsuarioRepository.findById(id);
    if (!registro) throw new NotFoundException('Usuário não encontrado');

    if (!dados.senha_atual) throw new ValidationException('Senha atual é obrigatória para atualizar o perfil');
    const senhaCorreta = await bcrypt.compare(dados.senha_atual, registro.senha);
    if (!senhaCorreta) throw new ForbiddenException('Senha atual incorreta');

    const usuario = Usuario.criar({ ...dados, id });
    const senhaHash = await bcrypt.hash(usuario.senha, SALT_ROUNDS);
    await UsuarioRepository.update(id, {
      nome: usuario.nome,
      email: usuario.email.toString(),
      senha: senhaHash
    });
    await UsuarioRepository.incrementTokenVersion(id);
    return { success: true };
  }

  async remover(id, usuarioAutenticado) {
    this.validarProprietario(usuarioAutenticado, id);
    await this.obterPorId(id);
    await UsuarioRepository.delete(id);
  }
}

export default new UsuarioService();
