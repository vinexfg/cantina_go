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
    const c = new Cantina(row.id, row.nome, row.email, row.senha);
    c.horario_abertura = row.horario_abertura || null;
    c.horario_fechamento = row.horario_fechamento || null;
    return c;
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
    } else if (dados.senha.length < 8) {
      erros.senha = 'Senha deve ter pelo menos 8 caracteres';
    } else if (!/[a-zA-Z]/.test(dados.senha) || !/[0-9]/.test(dados.senha)) {
      erros.senha = 'Senha deve conter letras e números';
    }

    if (Object.keys(erros).length > 0) {
      throw new ValidationException('Dados de cantina inválidos', erros);
    }
  }

  toPublicJSON() {
    return {
      id: this.id.toString(),
      nome: this.nome,
      horario_abertura: this.horario_abertura || null,
      horario_fechamento: this.horario_fechamento || null,
    };
  }

  toJSON() {
    return {
      id: this.id.toString(),
      nome: this.nome,
      email: this.email.toString(),
      horario_abertura: this.horario_abertura || null,
      horario_fechamento: this.horario_fechamento || null,
    };
  }
}

export default Cantina;
