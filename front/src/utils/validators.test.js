import { describe, it, expect } from 'vitest';
import { validarCampo, MIN_NOME_LENGTH, MIN_SENHA_LENGTH } from './validators';

describe('validarCampo — nome', () => {
  it('retorna erro para nome vazio', () => {
    expect(validarCampo('nome', '')).toBe('Nome é obrigatório');
    expect(validarCampo('nome', '   ')).toBe('Nome é obrigatório');
  });

  it('retorna erro para nome muito curto', () => {
    expect(validarCampo('nome', 'ab')).toBe(`Nome deve ter pelo menos ${MIN_NOME_LENGTH} caracteres`);
  });

  it('aceita nome válido', () => {
    expect(validarCampo('nome', 'Ana')).toBe('');
    expect(validarCampo('nome', 'João Silva')).toBe('');
  });
});

describe('validarCampo — email', () => {
  it('retorna erro para email vazio', () => {
    expect(validarCampo('email', '')).toBe('Email é obrigatório');
  });

  it('retorna erro para email sem @', () => {
    expect(validarCampo('email', 'invalido')).toBe('Email inválido');
  });

  it('retorna erro para email sem domínio', () => {
    expect(validarCampo('email', 'usuario@')).toBe('Email inválido');
  });

  it('aceita email válido', () => {
    expect(validarCampo('email', 'usuario@escola.br')).toBe('');
    expect(validarCampo('email', '  user@test.com  ')).toBe('');
  });
});

describe('validarCampo — confirmarEmail', () => {
  it('retorna erro quando campos não coincidem', () => {
    expect(validarCampo('confirmarEmail', 'outro@email.com', { emailAtual: 'user@email.com' })).toBe('Os e-mails não coincidem');
  });

  it('retorna erro para confirmação vazia', () => {
    expect(validarCampo('confirmarEmail', '')).toBe('Confirmação de email é obrigatória');
  });

  it('aceita quando emails coincidem', () => {
    expect(validarCampo('confirmarEmail', 'user@email.com', { emailAtual: 'user@email.com' })).toBe('');
  });
});

describe('validarCampo — senha', () => {
  it('retorna erro para senha vazia', () => {
    expect(validarCampo('senha', '')).toBe('Senha é obrigatória');
  });

  it('retorna erro para senha muito curta', () => {
    expect(validarCampo('senha', '1234567')).toBe(`Senha deve ter pelo menos ${MIN_SENHA_LENGTH} caracteres`);
  });

  it('aceita senha com 8 ou mais caracteres', () => {
    expect(validarCampo('senha', '12345678')).toBe('');
    expect(validarCampo('senha', 'senhaForte123')).toBe('');
  });
});

describe('validarCampo — cantinaId', () => {
  it('retorna erro quando nenhuma cantina selecionada', () => {
    expect(validarCampo('cantinaId', '')).toBe('Selecione uma cantina');
  });

  it('aceita cantina selecionada', () => {
    expect(validarCampo('cantinaId', 'abc-123')).toBe('');
  });
});
