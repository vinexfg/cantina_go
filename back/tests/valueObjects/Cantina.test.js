import { describe, it, expect } from 'vitest';
import Cantina from '../../valueObjects/Cantina.js';
import ValidationException from '../../exceptions/ValidationException.js';

const dadosValidos = { nome: 'Cantina Central', email: 'cantina@escola.br', senha: 'Senha123' };

describe('Cantina.criar', () => {
  it('cria instância com dados válidos', () => {
    const c = Cantina.criar(dadosValidos);
    expect(c.nome).toBe('Cantina Central');
    expect(c.email.toString()).toBe('cantina@escola.br');
  });

  it('usa id fornecido quando passado', () => {
    const id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const c = Cantina.criar({ ...dadosValidos, id });
    expect(c.id.toString()).toBe(id);
  });

  it('gera id quando não fornecido', () => {
    const c = Cantina.criar(dadosValidos);
    expect(c.id.toString()).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe('Cantina.validarDados', () => {
  it('lança quando nome está vazio', () => {
    expect(() => Cantina.criar({ ...dadosValidos, nome: '' }))
      .toThrow(ValidationException);
  });

  it('lança quando email está ausente', () => {
    expect(() => Cantina.criar({ ...dadosValidos, email: '' }))
      .toThrow(ValidationException);
  });

  it('lança quando senha tem menos de 8 caracteres', () => {
    expect(() => Cantina.criar({ ...dadosValidos, senha: 'Ab1' }))
      .toThrow(ValidationException);
  });

  it('lança quando senha não tem letras', () => {
    expect(() => Cantina.criar({ ...dadosValidos, senha: '12345678' }))
      .toThrow(ValidationException);
  });

  it('lança quando senha não tem números', () => {
    expect(() => Cantina.criar({ ...dadosValidos, senha: 'SenhaSemNum' }))
      .toThrow(ValidationException);
  });
});

describe('Cantina.fromRow', () => {
  it('converte row do banco em instância', () => {
    const c = Cantina.fromRow({ id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', nome: 'X', email: 'x@x.com', senha: '$hash' });
    expect(c.nome).toBe('X');
    expect(c.senha).toBe('$hash');
  });
});

describe('Cantina.toPublicJSON', () => {
  it('retorna apenas id e nome, sem email', () => {
    const c = Cantina.criar(dadosValidos);
    const pub = c.toPublicJSON();
    expect(pub).toHaveProperty('id');
    expect(pub).toHaveProperty('nome');
    expect(pub).not.toHaveProperty('email');
  });
});

describe('Cantina.toJSON', () => {
  it('retorna id, nome e email', () => {
    const c = Cantina.criar(dadosValidos);
    const json = c.toJSON();
    expect(json).toHaveProperty('email', 'cantina@escola.br');
    expect(json).not.toHaveProperty('senha');
  });
});
