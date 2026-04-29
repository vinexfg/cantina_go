import CantinaRepository from '../repositories/CantinaRepository.js';
import Cantina from '../valueObjects/Cantina.js';
import NotFoundException from '../exceptions/NotFoundException.js';

class CantinaService {
  async obterTodos() {
    const cantinas = await CantinaRepository.findAll();
    return cantinas.map(row => Cantina.fromRow(row).toJSON());
  }

  async obterPorId(id) {
    const cantina = await CantinaRepository.findById(id);
    if (!cantina) {
      throw new NotFoundException('Cantina não encontrada');
    }
    return Cantina.fromRow(cantina).toJSON();
  }

  async obterPorEmail(email) {
    const cantina = await CantinaRepository.findByEmail(email);
    if (!cantina) {
      throw new NotFoundException('Cantina não encontrada');
    }
    return Cantina.fromRow(cantina).toJSON();
  }

  async criar(dados) {
    const cantina = Cantina.criar(dados);
    const cantinaCriada = await CantinaRepository.create({
      id: cantina.id.toString(),
      nome: cantina.nome,
      email: cantina.email.toString()
    });
    return Cantina.fromRow(cantinaCriada).toJSON();
  }

  async atualizar(id, dados) {
    await this.obterPorId(id);
    const cantina = Cantina.criar({ ...dados, id });
    
    await CantinaRepository.update(id, {
      nome: cantina.nome,
      email: cantina.email.toString()
    });
    
    return { success: true };
  }

  async remover(id) {
    await this.obterPorId(id);
    await CantinaRepository.delete(id);
  }
}

export default new CantinaService();
