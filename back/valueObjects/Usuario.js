import ValidationException from '../exceptions/ValidationException.js';
import Email from './Email.js';
import Id from './Id.js';

class Usuario {
  constructor(id, nome, email, senha) {
    this.id = id instanceof Id ? id : new Id(id);
    this.nome = nome;
    this.email = email instanceof Email ? email : new Email(email);
    this.senha = senha;
  }

  static fromRow(row) {
    return new Usuario(row.id, row.nome, row.email, row.senha);
  }

  static criar(dados) {
    Usuario.validarDados(dados);
    return new Usuario(
      dados.id || new Id(),
      dados.nome,
      dados.email,
      dados.senha
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

    if (!dados.senha || dados.senha.trim() === '') {
      erros.senha = 'Senha é obrigatória';
    } else if (dados.senha.length < 8) {
      erros.senha = 'Senha deve ter pelo menos 8 caracteres';
    } else if (!/[a-zA-Z]/.test(dados.senha) || !/[0-9]/.test(dados.senha)) {
      erros.senha = 'Senha deve conter letras e números';
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
      email: this.email.toString(),
      senha: this.senha
    };
  }
}

export default Usuario;
