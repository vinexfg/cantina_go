import { describe, it, expect } from 'vitest';
import Usuario from '../../valueObjects/Usuario.js';
import ValidationException from '../../exceptions/ValidationException.js';

const dadosValidos = { nome: 'João Silva', email: 'joao@escola.br', senha: 'Senha123' };

describe('Usuario.criar', () => {
  it('cria instância com dados válidos', () => {
    const u = Usuario.criar(dadosValidos);
    expect(u.nome).toBe('João Silva');
    expect(u.email.toString()).toBe('joao@escola.br');
  });

  it('usa id fornecido quando passado', () => {
    const id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const u = Usuario.criar({ ...dadosValidos, id });
    expect(u.id.toString()).toBe(id);
  });

  it('gera id quando não fornecido', () => {
    const u = Usuario.criar(dadosValidos);
    expect(u.id.toString()).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe('Usuario.validarDados', () => {
  it('lança quando nome está vazio', () => {
    expect(() => Usuario.criar({ ...dadosValidos, nome: '' }))
      .toThrow(ValidationException);
  });

  it('lança quando email está ausente', () => {
    expect(() => Usuario.criar({ ...dadosValidos, email: '' }))
      .toThrow(ValidationException);
  });

  it('lança quando senha tem menos de 8 caracteres', () => {
    expect(() => Usuario.criar({ ...dadosValidos, senha: 'Ab1' }))
      .toThrow(ValidationException);
  });

  it('lança quando senha não tem letras', () => {
    expect(() => Usuario.criar({ ...dadosValidos, senha: '12345678' }))
      .toThrow(ValidationException);
  });

  it('lança quando senha não tem números', () => {
    expect(() => Usuario.criar({ ...dadosValidos, senha: 'SenhaSemNum' }))
      .toThrow(ValidationException);
  });
});

describe('Usuario.fromRow', () => {
  it('converte row do banco em instância', () => {
    const u = Usuario.fromRow({ id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', nome: 'Ana', email: 'ana@escola.br', senha: '$hash' });
    expect(u.nome).toBe('Ana');
    expect(u.senha).toBe('$hash');
  });
});

describe('Usuario.toJSON', () => {
  it('retorna id, nome e email sem senha', () => {
    const u = Usuario.criar(dadosValidos);
    const json = u.toJSON();
    expect(json).toHaveProperty('email', 'joao@escola.br');
    expect(json).not.toHaveProperty('senha');
  });
});

describe('Usuario.toJSONComSenha', () => {
  it('retorna id, nome, email e senha', () => {
    const u = Usuario.fromRow({ id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', nome: 'Ana', email: 'ana@escola.br', senha: '$hash' });
    const json = u.toJSONComSenha();
    expect(json).toHaveProperty('senha', '$hash');
  });
});
