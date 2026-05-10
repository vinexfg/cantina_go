import { describe, it, expect, vi } from 'vitest';
import { validar } from '../../middleware/ValidationMiddleware.js';
import ValidationException from '../../exceptions/ValidationException.js';

function makeReq(body) { return { body }; }
const res = {};
const next = vi.fn();

describe('validar middleware', () => {
  it('chama next() sem erro quando todos os campos estão presentes', () => {
    next.mockReset();
    const middleware = validar({ email: 'Email obrigatório', senha: 'Senha obrigatória' });
    middleware(makeReq({ email: 'a@b.com', senha: '123' }), res, next);
    expect(next).toHaveBeenCalledWith();
    expect(next).not.toHaveBeenCalledWith(expect.any(Error));
  });

  it('chama next(ValidationException) quando campo está ausente', () => {
    next.mockReset();
    const middleware = validar({ email: 'Email obrigatório' });
    middleware(makeReq({}), res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ValidationException));
  });

  it('chama next(ValidationException) quando campo é null', () => {
    next.mockReset();
    const middleware = validar({ nome: 'Nome obrigatório' });
    middleware(makeReq({ nome: null }), res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ValidationException));
  });

  it('chama next(ValidationException) quando campo é string vazia', () => {
    next.mockReset();
    const middleware = validar({ nome: 'Nome obrigatório' });
    middleware(makeReq({ nome: '' }), res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ValidationException));
  });

  it('inclui mensagem correta no erro', () => {
    next.mockReset();
    const middleware = validar({ senha: 'Senha é obrigatória' });
    middleware(makeReq({}), res, next);
    const erro = next.mock.calls[0][0];
    expect(erro.fields).toHaveProperty('senha', 'Senha é obrigatória');
  });

  it('valida múltiplos campos e acumula todos os erros', () => {
    next.mockReset();
    const middleware = validar({ email: 'Email é obrigatório', senha: 'Senha é obrigatória' });
    middleware(makeReq({}), res, next);
    const erro = next.mock.calls[0][0];
    expect(erro.fields).toHaveProperty('email');
    expect(erro.fields).toHaveProperty('senha');
  });
});
