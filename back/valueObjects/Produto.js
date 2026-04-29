import ValidationException from '../exceptions/ValidationException.js';
import Id from './Id.js';

class Preco {
  constructor(valor) {
    this.validate(valor);
    this.valor = parseFloat(valor);
  }

  validate(valor) {
    if (isNaN(parseFloat(valor)) || parseFloat(valor) < 0) {
      throw new ValidationException('Preço inválido: deve ser um número positivo');
    }
  }

  toString() {
    return this.valor.toFixed(2);
  }

  toJSON() {
    return this.valor;
  }

  equals(other) {
    if (!(other instanceof Preco)) return false;
    return this.valor === other.valor;
  }
}

class Produto {
  constructor(id, nome, descricao, preco, status = 'disponivel') {
    this.id = id instanceof Id ? id : new Id(id);
    this.nome = nome;
    this.descricao = descricao;
    this.preco = preco instanceof Preco ? preco : new Preco(preco);
    this.status = status;
  }

  static fromRow(row) {
    return new Produto(row.id, row.nome, row.descricao, row.preco, row.status);
  }

  static criar(dados) {
    Produto.validarDados(dados);
    return new Produto(
      dados.id || new Id(),
      dados.nome,
      dados.descricao,
      dados.preco,
      dados.status || 'disponivel'
    );
  }

  static validarDados(dados) {
    const erros = {};

    if (!dados.nome || dados.nome.trim() === '') {
      erros.nome = 'Nome do produto é obrigatório';
    }

    if (!dados.descricao || dados.descricao.trim() === '') {
      erros.descricao = 'Descrição é obrigatória';
    }

    if (isNaN(parseFloat(dados.preco)) || parseFloat(dados.preco) < 0) {
      erros.preco = 'Preço deve ser um número positivo';
    }

    if (dados.status && !['disponivel', 'indisponivel', 'descontinuado'].includes(dados.status)) {
      erros.status = 'Status inválido';
    }

    if (Object.keys(erros).length > 0) {
      throw new ValidationException('Dados de produto inválidos', erros);
    }
  }

  estaDisponivel() {
    return this.status === 'disponivel';
  }

  marcarIndisponivel() {
    this.status = 'indisponivel';
  }

  marcarDescontinuado() {
    this.status = 'descontinuado';
  }

  toJSON() {
    return {
      id: this.id.toString(),
      nome: this.nome,
      descricao: this.descricao,
      preco: this.preco.toJSON(),
      status: this.status
    };
  }
}

export default Produto;
