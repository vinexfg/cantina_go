import ValidationException from '../exceptions/ValidationException.js';
import Id from './Id.js';

const STATUS_VALIDOS = ['pendente', 'confirmada', 'cancelada', 'concluida'];

class Reserva {
  constructor(id, cantina_id, usuario_id, data_reserva, status, itens = []) {
    this.id = id instanceof Id ? id : new Id(id);
    this.cantina_id = cantina_id;
    this.usuario_id = usuario_id || null;
    this.data_reserva = data_reserva || new Date();
    this.status = status || 'pendente';
    this.itens = itens;
  }

  static fromRow(row, itens = []) {
    return new Reserva(row.id, row.cantina_id, row.usuario_id, row.data_reserva || row.created_at, row.status, itens);
  }

  static criar(dados) {
    Reserva.validarDados(dados);
    return new Reserva(
      dados.id || new Id(),
      dados.cantina_id,
      dados.usuario_id || null,
      dados.data_reserva || new Date(),
      dados.status || 'pendente',
      dados.itens || []
    );
  }

  static validarDados(dados) {
    const erros = {};

    if (!dados.cantina_id) {
      erros.cantina_id = 'cantina_id é obrigatório';
    }

    if (!dados.itens || !Array.isArray(dados.itens) || dados.itens.length === 0) {
      erros.itens = 'A reserva deve ter pelo menos um item';
    }

    if (dados.status && !STATUS_VALIDOS.includes(dados.status)) {
      erros.status = `Status inválido. Use: ${STATUS_VALIDOS.join(', ')}`;
    }

    if (Object.keys(erros).length > 0) {
      throw new ValidationException('Dados de reserva inválidos', erros);
    }
  }

  toJSON() {
    return {
      id: this.id.toString(),
      cantina_id: this.cantina_id,
      usuario_id: this.usuario_id,
      data_reserva: this.data_reserva,
      status: this.status,
      itens: this.itens
    };
  }
}

export { STATUS_VALIDOS };
export default Reserva;
