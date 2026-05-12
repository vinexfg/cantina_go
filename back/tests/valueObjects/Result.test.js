import { describe, it, expect, vi } from 'vitest';
import Result from '../../valueObjects/Result.js';

describe('Result factories', () => {
  it('ok retorna sucesso com status 200', () => {
    const r = Result.ok({ id: 1 }, 'OK');
    expect(r.success).toBe(true);
    expect(r.statusCode).toBe(200);
    expect(r.data).toEqual({ id: 1 });
    expect(r.message).toBe('OK');
  });

  it('created retorna sucesso com status 201', () => {
    const r = Result.created({ id: 2 });
    expect(r.statusCode).toBe(201);
    expect(r.success).toBe(true);
  });

  it('notFound retorna falha com status 404', () => {
    const r = Result.notFound('Não achei');
    expect(r.success).toBe(false);
    expect(r.statusCode).toBe(404);
    expect(r.message).toBe('Não achei');
  });

  it('badRequest retorna falha com status 400', () => {
    const r = Result.badRequest('Inválido');
    expect(r.statusCode).toBe(400);
    expect(r.success).toBe(false);
  });

  it('internalError retorna falha com status 500', () => {
    const r = Result.internalError();
    expect(r.statusCode).toBe(500);
    expect(r.success).toBe(false);
  });

  it('conflict retorna falha com status 409', () => {
    const r = Result.conflict('Duplicado');
    expect(r.statusCode).toBe(409);
  });

  it('forbidden retorna falha com status 403', () => {
    const r = Result.forbidden('Proibido');
    expect(r.statusCode).toBe(403);
  });
});

describe('Result.okPaginado', () => {
  it('inclui pagination no JSON', () => {
    const r = Result.okPaginado([1, 2], { page: 1, total: 2 });
    const json = r.toJSON();
    expect(json.pagination).toEqual({ page: 1, total: 2 });
    expect(json.data).toEqual([1, 2]);
  });
});

describe('Result.toJSON', () => {
  it('omite data quando null', () => {
    const r = Result.notFound();
    const json = r.toJSON();
    expect(json).not.toHaveProperty('data');
  });

  it('omite message quando null', () => {
    const r = Result.ok({ id: 1 });
    const json = r.toJSON();
    expect(json).not.toHaveProperty('message');
  });

  it('inclui data quando presente', () => {
    const r = Result.ok({ x: 1 });
    expect(r.toJSON()).toHaveProperty('data');
  });
});

describe('Result.send', () => {
  it('chama res.status().json() com os dados corretos', () => {
    const jsonMock = vi.fn();
    const statusMock = vi.fn(() => ({ json: jsonMock }));
    const res = { status: statusMock };

    Result.ok({ id: 1 }, 'msg').send(res);

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ data: { id: 1 } }));
  });
});

describe('Result.isSuccess / isFailure', () => {
  it('isSuccess retorna true para ok', () => {
    expect(Result.ok(null).isSuccess()).toBe(true);
  });

  it('isFailure retorna true para notFound', () => {
    expect(Result.notFound().isFailure()).toBe(true);
  });
});
