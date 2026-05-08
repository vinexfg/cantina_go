import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ErrorMiddleware from '../../middleware/ErrorMiddleware.js';
import AppException from '../../exceptions/AppException.js';
import ValidationException from '../../exceptions/ValidationException.js';
import NotFoundException from '../../exceptions/NotFoundException.js';

function makeRes() {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return { status, json };
}

const req = {};
const next = vi.fn();

describe('ErrorMiddleware.handle — AppException', () => {
  it('chama toResult().send(res) para AppException', () => {
    const res = makeRes();
    const erro = new ValidationException('Inválido', { campo: 'erro' });
    ErrorMiddleware.handle(erro, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('retorna 404 para NotFoundException', () => {
    const res = makeRes();
    const erro = new NotFoundException('Não encontrado');
    ErrorMiddleware.handle(erro, req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});

describe('ErrorMiddleware.handle — erro genérico', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.NODE_ENV;
  });

  it('em dev retorna a mensagem real do erro', () => {
    process.env.NODE_ENV = 'development';
    const res = makeRes();
    const erro = new Error('mensagem real');
    ErrorMiddleware.handle(erro, req, res, next);
    const jsonArg = res.status.mock.results[0].value.json.mock.calls[0][0];
    expect(jsonArg.message).toBe('mensagem real');
  });

  it('em produção retorna mensagem genérica', () => {
    process.env.NODE_ENV = 'production';
    const res = makeRes();
    const erro = new Error('detalhe interno');
    ErrorMiddleware.handle(erro, req, res, next);
    const jsonArg = res.status.mock.results[0].value.json.mock.calls[0][0];
    expect(jsonArg.message).toBe('Erro interno do servidor');
    expect(jsonArg.message).not.toContain('detalhe interno');
  });

  it('retorna status 500 para erros não tratados', () => {
    process.env.NODE_ENV = 'development';
    const res = makeRes();
    ErrorMiddleware.handle(new Error('qualquer'), req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
