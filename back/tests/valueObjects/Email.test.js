import { describe, it, expect } from 'vitest';
import Email from '../../valueObjects/Email.js';

describe('Email', () => {
  it('aceita email válido', () => {
    const email = new Email('usuario@escola.br');
    expect(email.toString()).toBe('usuario@escola.br');
  });

  it('normaliza email para minúsculas', () => {
    const email = new Email('USUARIO@ESCOLA.BR');
    expect(email.toString()).toBe('usuario@escola.br');
  });

  it('remove espaços ao redor', () => {
    const email = new Email('  usuario@escola.br  ');
    expect(email.toString()).toBe('usuario@escola.br');
  });

  it('lança erro para email sem @', () => {
    expect(() => new Email('invalido')).toThrow('Email inválido');
  });

  it('lança erro para email sem domínio', () => {
    expect(() => new Email('usuario@')).toThrow('Email inválido');
  });

  it('lança erro para email sem usuário', () => {
    expect(() => new Email('@escola.br')).toThrow('Email inválido');
  });

  it('dois Emails com mesmo valor são iguais', () => {
    const a = new Email('user@test.com');
    const b = new Email('USER@TEST.COM');
    expect(a.equals(b)).toBe(true);
  });

  it('toJSON retorna string do email', () => {
    const email = new Email('user@test.com');
    expect(email.toJSON()).toBe('user@test.com');
  });
});
