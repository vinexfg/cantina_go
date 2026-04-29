import ValidationException from '../exceptions/ValidationException.js';
import Email from './Email.js';
import Id from './Id.js';

class Usuario {
  constructor(id, nome, email) {
    this.id = id instanceof Id ? id : new Id(id);
    this.nome = nome;
    this.email = email instanceof Email ? email : new Email(email);
  }

  static fromRow(row) {
    return new Usuario(row.id, row.nome, row.email);
  }

  static criar(dados) {
    Usuario.validarDados(dados);
    return new Usuario(
      dados.id || new Id(),
      dados.nome,
      dados.email
    );
  }

  static validarDados(dados) {
    const erros = {};

    if (!dados.nome || dados.nome.trim() === '') {
      erros.nome = 'Nome é obrigatório';
    }

    if (!dados.email) {
      erros.email = 'Email é obrigatório';
    }

    if (Object.keys(erros).length > 0) {
      throw new ValidationException('Dados inválidos', erros);
    }
  }

  toJSON() {
    return {
      id: this.id.toString(),
      nome: this.nome,
      email: this.email.toString()
    };
  }

  toJSONComSenha() {
    return {
      id: this.id.toString(),
      nome: this.nome,
      email: this.email.toString()
    };
  }
}

export default Usuario;
