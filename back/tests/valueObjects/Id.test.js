import { describe, it, expect } from 'vitest';
import Id from '../../valueObjects/Id.js';

describe('Id', () => {
  it('gera um UUID válido quando não recebe valor', () => {
    const id = new Id();
    expect(id.toString()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it('aceita um UUID válido existente', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const id = new Id(uuid);
    expect(id.toString()).toBe(uuid);
  });

  it('lança erro para UUID inválido', () => {
    expect(() => new Id('nao-e-um-uuid')).toThrow('ID inválido');
  });

  it('lança erro para string vazia como UUID', () => {
    expect(() => new Id('abc')).toThrow('ID inválido');
  });

  it('dois Ids com mesmo valor são iguais', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const a = new Id(uuid);
    const b = new Id(uuid);
    expect(a.equals(b)).toBe(true);
  });

  it('dois Ids com valores diferentes não são iguais', () => {
    const a = new Id();
    const b = new Id();
    expect(a.equals(b)).toBe(false);
  });

  it('toJSON retorna a string do UUID', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const id = new Id(uuid);
    expect(id.toJSON()).toBe(uuid);
  });
});
