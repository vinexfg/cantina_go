import ValidationException from '../exceptions/ValidationException.js';
import Email from './Email.js';
import Id from './Id.js';

class Cantina {
  constructor(id, nome, email, senha) {
    this.id = id instanceof Id ? id : new Id(id);
    this.nome = nome;
    this.email = email instanceof Email ? email : new Email(email);
    this.senha = senha;
  }

  static fromRow(row) {
    return new Cantina(row.id, row.nome, row.email, row.senha);
  }

  static criar(dados) {
    Cantina.validarDados(dados);
    return new Cantina(
      dados.id || new Id(),
      dados.nome,
      dados.email,
      dados.senha
    );
  }

  static validarDados(dados) {
    const erros = {};

    if (!dados.nome || dados.nome.trim() === '') {
      erros.nome = 'Nome da cantina é obrigatório';
    }

    if (!dados.email) {
      erros.email = 'Email é obrigatório';
    }

    if (!dados.senha || dados.senha.trim() === '') {
      erros.senha = 'Senha é obrigatória';
    }

    if (Object.keys(erros).length > 0) {
      throw new ValidationException('Dados de cantina inválidos', erros);
    }
  }

  toJSON() {
    return {
      id: this.id.toString(),
      nome: this.nome,
      email: this.email.toString()
    };
  }
}

export default Cantina;
