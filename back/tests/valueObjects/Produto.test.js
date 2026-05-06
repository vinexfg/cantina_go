import { describe, it, expect } from 'vitest';
import Produto from '../../valueObjects/Produto.js';
import ValidationException from '../../exceptions/ValidationException.js';

const cantina_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

describe('Produto.criar', () => {
  it('cria produto válido com todos os campos', () => {
    const p = Produto.criar({ cantina_id, nome: 'Pastel', preco: 5.5, disponivel: true });
    expect(p.nome).toBe('Pastel');
    expect(p.preco.toJSON()).toBe(5.5);
    expect(p.disponivel).toBe(true);
    expect(p.cantina_id).toBe(cantina_id);
  });

  it('cria produto disponível por padrão', () => {
    const p = Produto.criar({ cantina_id, nome: 'Suco', preco: 3 });
    expect(p.disponivel).toBe(true);
  });

  it('cria produto com quantidade_limite', () => {
    const p = Produto.criar({ cantina_id, nome: 'Pão', preco: 2, quantidade_limite: 5 });
    expect(p.quantidade_limite).toBe(5);
  });

  it('lança ValidationException quando nome está ausente', () => {
    expect(() => Produto.criar({ cantina_id, preco: 5 })).toThrow(ValidationException);
  });

  it('lança ValidationException quando cantina_id está ausente', () => {
    expect(() => Produto.criar({ nome: 'Suco', preco: 3 })).toThrow(ValidationException);
  });

  it('lança ValidationException para preço negativo', () => {
    expect(() => Produto.criar({ cantina_id, nome: 'Item', preco: -1 })).toThrow(ValidationException);
  });

  it('lança ValidationException para preço não numérico', () => {
    expect(() => Produto.criar({ cantina_id, nome: 'Item', preco: 'abc' })).toThrow(ValidationException);
  });
});

describe('Produto.fromRow', () => {
  it('reconstrói produto a partir de linha do banco', () => {
    const row = { id: cantina_id, cantina_id, nome: 'Coxinha', descricao: null, preco: '4.50', disponivel: true, quantidade_limite: null };
    const p = Produto.fromRow(row);
    expect(p.nome).toBe('Coxinha');
    expect(p.preco.toJSON()).toBeCloseTo(4.5);
  });
});

describe('Produto.toJSON', () => {
  it('serializa produto corretamente', () => {
    const p = Produto.criar({ cantina_id, nome: 'Limonada', preco: 6 });
    const json = p.toJSON();
    expect(json).toMatchObject({ nome: 'Limonada', preco: 6, disponivel: true, cantina_id });
    expect(typeof json.id).toBe('string');
  });
});

describe('Produto.estaDisponivel', () => {
  it('retorna true quando disponível', () => {
    const p = Produto.criar({ cantina_id, nome: 'X', preco: 1, disponivel: true });
    expect(p.estaDisponivel()).toBe(true);
  });

  it('retorna false quando indisponível', () => {
    const p = Produto.criar({ cantina_id, nome: 'X', preco: 1, disponivel: false });
    expect(p.estaDisponivel()).toBe(false);
  });
});
