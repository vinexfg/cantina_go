import ValidationException from '../exceptions/ValidationException.js';
import Id from './Id.js';

class ReservaItem {
  constructor(id, reserva_id, produto_id, quantidade) {
    this.id = id instanceof Id ? id : new Id(id);
    this.reserva_id = reserva_id;
    this.produto_id = produto_id;
    this.quantidade = quantidade;
  }

  static fromRow(row) {
    return new ReservaItem(row.id, row.reserva_id, row.produto_id, row.quantidade);
  }

  static criar(dados) {
    ReservaItem.validarDados(dados);
    return new ReservaItem(
      dados.id || new Id(),
      dados.reserva_id,
      dados.produto_id,
      parseInt(dados.quantidade)
    );
  }

  static validarDados(dados) {
    const erros = {};

    if (!dados.produto_id) {
      erros.produto_id = 'produto_id é obrigatório';
    }

    if (!dados.quantidade || parseInt(dados.quantidade) <= 0) {
      erros.quantidade = 'Quantidade deve ser maior que zero';
    }

    if (Object.keys(erros).length > 0) {
      throw new ValidationException('Dados de item inválidos', erros);
    }
  }

  toJSON() {
    return {
      id: this.id.toString(),
      reserva_id: this.reserva_id,
      produto_id: this.produto_id,
      quantidade: this.quantidade
    };
  }
}

export default ReservaItem;
