import bcrypt from 'bcrypt';
import CantinaRepository from '../repositories/CantinaRepository.js';
import Cantina from '../valueObjects/Cantina.js';
import NotFoundException from '../exceptions/NotFoundException.js';
import ForbiddenException from '../exceptions/ForbiddenException.js';
import ValidationException from '../exceptions/ValidationException.js';

const SALT_ROUNDS = 10;

class CantinaService {
  validarProprietaria(usuarioAutenticado, cantina_id) {
    if (!usuarioAutenticado || usuarioAutenticado.tipo !== 'cantina' || String(usuarioAutenticado.id) !== String(cantina_id)) {
      throw new ForbiddenException('Acesso negado');
    }
  }

  async listar() {
    const cantinas = await CantinaRepository.findAll();
    return cantinas.map(row => Cantina.fromRow(row).toPublicJSON());
  }

  async obterTodos() {
    const cantinas = await CantinaRepository.findAll();
    return cantinas.map(row => Cantina.fromRow(row).toJSON());
  }

  async obterPorId(id) {
    const cantina = await CantinaRepository.findById(id);
    if (!cantina) throw new NotFoundException('Cantina não encontrada');
    return Cantina.fromRow(cantina).toJSON();
  }

  async obterPorEmail(email) {
    const cantina = await CantinaRepository.findByEmail(email);
    if (!cantina) throw new NotFoundException('Cantina não encontrada');
    return Cantina.fromRow(cantina).toJSON();
  }

  async criar(dados) {
    const cantina = Cantina.criar(dados);
    const senhaHash = await bcrypt.hash(cantina.senha, SALT_ROUNDS);
    const cantinaCriada = await CantinaRepository.create({
      id: cantina.id.toString(),
      nome: cantina.nome,
      email: cantina.email.toString(),
      senha: senhaHash
    });
    return Cantina.fromRow(cantinaCriada).toJSON();
  }

  async atualizar(id, dados, usuarioAutenticado) {
    this.validarProprietaria(usuarioAutenticado, id);
    const registro = await CantinaRepository.findById(id);
    if (!registro) throw new NotFoundException('Cantina não encontrada');

    if (!dados.senha_atual) throw new ValidationException('Senha atual é obrigatória para atualizar o perfil');
    const senhaCorreta = await bcrypt.compare(dados.senha_atual, registro.senha);
    if (!senhaCorreta) throw new ForbiddenException('Senha atual incorreta');

    const cantina = Cantina.criar({ ...dados, id });
    const senhaHash = await bcrypt.hash(cantina.senha, SALT_ROUNDS);
    await CantinaRepository.update(id, {
      nome: cantina.nome,
      email: cantina.email.toString(),
      senha: senhaHash
    });
    await CantinaRepository.incrementTokenVersion(id);
    return { success: true };
  }

  async remover(id, usuarioAutenticado) {
    this.validarProprietaria(usuarioAutenticado, id);
    await this.obterPorId(id);
    await CantinaRepository.delete(id);
  }
}

export default new CantinaService();
