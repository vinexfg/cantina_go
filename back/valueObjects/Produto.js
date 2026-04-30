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
  constructor(id, cantina_id, nome, descricao, preco, disponivel = true) {
    this.id = id instanceof Id ? id : new Id(id);
    this.cantina_id = cantina_id;
    this.nome = nome;
    this.descricao = descricao;
    this.preco = preco instanceof Preco ? preco : new Preco(preco);
    this.disponivel = disponivel === true || disponivel === 'true' || disponivel === 1;
  }

  static fromRow(row) {
    return new Produto(row.id, row.cantina_id, row.nome, row.descricao, row.preco, row.disponivel);
  }

  static criar(dados) {
    Produto.validarDados(dados);
    return new Produto(
      dados.id || new Id(),
      dados.cantina_id,
      dados.nome,
      dados.descricao || null,
      dados.preco,
      dados.disponivel !== undefined ? dados.disponivel : true
    );
  }

  static validarDados(dados) {
    const erros = {};

    if (!dados.cantina_id) {
      erros.cantina_id = 'cantina_id é obrigatório';
    }

    if (!dados.nome || dados.nome.trim() === '') {
      erros.nome = 'Nome do produto é obrigatório';
    }

    if (isNaN(parseFloat(dados.preco)) || parseFloat(dados.preco) < 0) {
      erros.preco = 'Preço deve ser um número positivo';
    }

    if (Object.keys(erros).length > 0) {
      throw new ValidationException('Dados de produto inválidos', erros);
    }
  }

  estaDisponivel() {
    return this.disponivel === true;
  }

  toJSON() {
    return {
      id: this.id.toString(),
      cantina_id: this.cantina_id,
      nome: this.nome,
      descricao: this.descricao,
      preco: this.preco.toJSON(),
      disponivel: this.disponivel
    };
  }
}

export default Produto;
