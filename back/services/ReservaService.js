import ReservaRepository from '../repositories/ReservaRepository.js';
import Reserva, { STATUS_VALIDOS } from '../valueObjects/Reserva.js';
import ReservaItem from '../valueObjects/ReservaItem.js';
import Id from '../valueObjects/Id.js';
import NotFoundException from '../exceptions/NotFoundException.js';
import ValidationException from '../exceptions/ValidationException.js';

class ReservaService {
  async obterTodos() {
    const reservas = await ReservaRepository.findAll();
    return reservas.map(row => Reserva.fromRow(row).toJSON());
  }

  async obterPorId(id) {
    const reserva = await ReservaRepository.findById(id);
    if (!reserva) throw new NotFoundException('Reserva não encontrada');

    const itensRows = await ReservaRepository.findItensByReserva(id);
    const itens = itensRows.map(row => ReservaItem.fromRow(row).toJSON());
    return Reserva.fromRow(reserva, itens).toJSON();
  }

  async obterPorCantina(cantina_id) {
    const reservas = await ReservaRepository.findByCantina(cantina_id);
    return Promise.all(
      reservas.map(async (row) => {
        const itensRows = await ReservaRepository.findItensByReserva(row.id);
        const itens = itensRows.map(item => ({
          id: item.id,
          produto_id: item.produto_id,
          produto_nome: item.produto_nome,
          quantidade: item.quantidade,
          preco: parseFloat(item.produto_preco),
        }));
        const total = itens.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
        return {
          ...Reserva.fromRow(row).toJSON(),
          usuario_nome: row.usuario_nome || null,
          criado_em: row.created_at,
          itens,
          total,
        };
      })
    );
  }

  async obterPorUsuario(usuario_id) {
    const reservas = await ReservaRepository.findByUsuario(usuario_id);
    return Promise.all(
      reservas.map(async (row) => {
        const itensRows = await ReservaRepository.findItensByReserva(row.id);
        const itens = itensRows.map(item => ({
          id: item.id,
          produto_id: item.produto_id,
          produto_nome: item.produto_nome,
          quantidade: item.quantidade,
          preco: parseFloat(item.produto_preco),
        }));
        const total = itens.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
        return {
          ...Reserva.fromRow(row).toJSON(),
          criado_em: row.created_at,
          itens,
          total,
        };
      })
    );
  }

  async criar(dados) {
    const reserva = Reserva.criar(dados);

    const itensVO = dados.itens.map(item =>
      ReservaItem.criar({ ...item, reserva_id: reserva.id.toString() })
    );

    const reservaData = {
      id: reserva.id.toString(),
      cantina_id: reserva.cantina_id,
      usuario_id: reserva.usuario_id,
      status: reserva.status
    };

    const itensData = itensVO.map(item => ({
      id: item.id.toString(),
      produto_id: item.produto_id,
      quantidade: item.quantidade
    }));

    const { reserva: criada, itens } = await ReservaRepository.createComItens(reservaData, itensData);
    const itensJSON = itens.map(row => ReservaItem.fromRow(row).toJSON());
    return Reserva.fromRow(criada, itensJSON).toJSON();
  }

  async atualizarStatus(id, status) {
    if (!STATUS_VALIDOS.includes(status)) {
      throw new ValidationException(`Status inválido. Use: ${STATUS_VALIDOS.join(', ')}`);
    }
    const reserva = await ReservaRepository.findById(id);
    if (!reserva) throw new NotFoundException('Reserva não encontrada');

    await ReservaRepository.updateStatus(id, status);
    return { success: true };
  }

  async remover(id) {
    const reserva = await ReservaRepository.findById(id);
    if (!reserva) throw new NotFoundException('Reserva não encontrada');
    await ReservaRepository.delete(id);
  }
}

export default new ReservaService();
