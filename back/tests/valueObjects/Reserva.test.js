import { describe, it, expect } from 'vitest';
import Reserva, { STATUS_VALIDOS } from '../../valueObjects/Reserva.js';
import ValidationException from '../../exceptions/ValidationException.js';

const cantina_id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const usuario_id = 'a47ac10b-58cc-4372-a567-0e02b2c3d480';
const item = { produto_id: 'b47ac10b-58cc-4372-a567-0e02b2c3d481', quantidade: 2 };

describe('STATUS_VALIDOS', () => {
  it('contém os quatro status esperados', () => {
    expect(STATUS_VALIDOS).toEqual(['pendente', 'confirmada', 'cancelada', 'concluida']);
  });
});

describe('Reserva.criar', () => {
  it('cria reserva válida com status padrão pendente', () => {
    const r = Reserva.criar({ cantina_id, usuario_id, itens: [item] });
    expect(r.status).toBe('pendente');
    expect(r.cantina_id).toBe(cantina_id);
    expect(r.usuario_id).toBe(usuario_id);
  });

  it('lança ValidationException quando cantina_id está ausente', () => {
    expect(() => Reserva.criar({ usuario_id, itens: [item] })).toThrow(ValidationException);
  });

  it('lança ValidationException quando itens está vazio', () => {
    expect(() => Reserva.criar({ cantina_id, usuario_id, itens: [] })).toThrow(ValidationException);
  });

  it('lança ValidationException quando itens está ausente', () => {
    expect(() => Reserva.criar({ cantina_id, usuario_id })).toThrow(ValidationException);
  });

  it('lança ValidationException para status inválido', () => {
    expect(() => Reserva.criar({ cantina_id, usuario_id, itens: [item], status: 'invalido' })).toThrow(ValidationException);
  });

  it('aceita status válido explicitamente', () => {
    const r = Reserva.criar({ cantina_id, usuario_id, itens: [item], status: 'confirmada' });
    expect(r.status).toBe('confirmada');
  });
});

describe('Reserva.toJSON', () => {
  it('serializa reserva corretamente', () => {
    const r = Reserva.criar({ cantina_id, usuario_id, itens: [item] });
    const json = r.toJSON();
    expect(json).toMatchObject({ cantina_id, usuario_id, status: 'pendente' });
    expect(typeof json.id).toBe('string');
  });
});
