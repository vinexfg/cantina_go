import { describe, it, expect } from 'vitest';
import ReservaItem from '../../valueObjects/ReservaItem.js';
import ValidationException from '../../exceptions/ValidationException.js';

const produtoId  = 'c47ac10b-58cc-4372-a567-0e02b2c3d482';
const reservaId  = 'b47ac10b-58cc-4372-a567-0e02b2c3d481';
const dadosValidos = { produto_id: produtoId, reserva_id: reservaId, quantidade: 2 };

describe('ReservaItem.criar', () => {
  it('cria instância com dados válidos', () => {
    const item = ReservaItem.criar(dadosValidos);
    expect(item.produto_id).toBe(produtoId);
    expect(item.quantidade).toBe(2);
  });

  it('converte quantidade para inteiro', () => {
    const item = ReservaItem.criar({ ...dadosValidos, quantidade: '3' });
    expect(item.quantidade).toBe(3);
  });

  it('gera id quando não fornecido', () => {
    const item = ReservaItem.criar(dadosValidos);
    expect(item.id.toString()).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe('ReservaItem.validarDados', () => {
  it('lança quando produto_id está ausente', () => {
    expect(() => ReservaItem.criar({ ...dadosValidos, produto_id: '' }))
      .toThrow(ValidationException);
  });

  it('lança quando quantidade é zero', () => {
    expect(() => ReservaItem.criar({ ...dadosValidos, quantidade: 0 }))
      .toThrow(ValidationException);
  });

  it('lança quando quantidade é negativa', () => {
    expect(() => ReservaItem.criar({ ...dadosValidos, quantidade: -1 }))
      .toThrow(ValidationException);
  });
});

describe('ReservaItem.fromRow', () => {
  it('converte row do banco em instância', () => {
    const item = ReservaItem.fromRow({
      id: 'd47ac10b-58cc-4372-a567-0e02b2c3d483',
      reserva_id: reservaId,
      produto_id: produtoId,
      quantidade: 5,
    });
    expect(item.quantidade).toBe(5);
    expect(item.reserva_id).toBe(reservaId);
  });
});

describe('ReservaItem.toJSON', () => {
  it('retorna todos os campos esperados', () => {
    const item = ReservaItem.criar(dadosValidos);
    const json = item.toJSON();
    expect(json).toHaveProperty('id');
    expect(json).toHaveProperty('reserva_id', reservaId);
    expect(json).toHaveProperty('produto_id', produtoId);
    expect(json).toHaveProperty('quantidade', 2);
  });
});
