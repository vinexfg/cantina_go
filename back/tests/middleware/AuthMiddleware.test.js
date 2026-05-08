import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../repositories/UsuarioRepository.js', () => ({
  default: { findById: vi.fn() }
}));

vi.mock('../../repositories/CantinaRepository.js', () => ({
  default: { findById: vi.fn() }
}));

vi.mock('jsonwebtoken', () => ({
  default: { verify: vi.fn() }
}));

import UsuarioRepository from '../../repositories/UsuarioRepository.js';
import CantinaRepository from '../../repositories/CantinaRepository.js';
import jwt from 'jsonwebtoken';
import AuthMiddleware from '../../middleware/AuthMiddleware.js';

function makeRes() {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return { status, json, _getStatus: () => status.mock.calls[0]?.[0] };
}

const next = vi.fn();

beforeEach(() => { vi.clearAllMocks(); });

describe('AuthMiddleware.verificar — token ausente', () => {
  it('retorna 403 sem header Authorization', async () => {
    const res = makeRes();
    await AuthMiddleware.verificar({ headers: {} }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('retorna 403 com header malformado (sem Bearer)', async () => {
    const res = makeRes();
    await AuthMiddleware.verificar({ headers: { authorization: 'Token abc' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe('AuthMiddleware.verificar — token inválido', () => {
  it('retorna 403 para token com assinatura inválida', async () => {
    const res = makeRes();
    const err = new Error('invalid signature');
    err.name = 'JsonWebTokenError';
    jwt.verify.mockImplementation(() => { throw err; });
    await AuthMiddleware.verificar({ headers: { authorization: 'Bearer bad-token' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('retorna 403 para token expirado', async () => {
    const res = makeRes();
    const err = new Error('jwt expired');
    err.name = 'TokenExpiredError';
    jwt.verify.mockImplementation(() => { throw err; });
    await AuthMiddleware.verificar({ headers: { authorization: 'Bearer expired-token' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe('AuthMiddleware.verificar — usuário não encontrado no banco', () => {
  it('retorna 403 quando usuário foi deletado', async () => {
    jwt.verify.mockReturnValue({ id: 'u1', tipo: 'usuario', token_version: 0 });
    UsuarioRepository.findById.mockResolvedValue(null);
    const res = makeRes();
    await AuthMiddleware.verificar({ headers: { authorization: 'Bearer valid' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('retorna 403 quando token_version não confere (token invalidado)', async () => {
    jwt.verify.mockReturnValue({ id: 'u1', tipo: 'usuario', token_version: 0 });
    UsuarioRepository.findById.mockResolvedValue({ id: 'u1', token_version: 1 });
    const res = makeRes();
    await AuthMiddleware.verificar({ headers: { authorization: 'Bearer valid' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe('AuthMiddleware.verificar — token válido', () => {
  it('popula req.usuario e chama next() para usuário', async () => {
    jwt.verify.mockReturnValue({ id: 'u1', tipo: 'usuario', token_version: 2 });
    UsuarioRepository.findById.mockResolvedValue({ id: 'u1', token_version: 2 });
    const req = { headers: { authorization: 'Bearer valid' } };
    const res = makeRes();
    await AuthMiddleware.verificar(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.usuario).toBeDefined();
    expect(req.usuario.id).toBe('u1');
  });

  it('usa CantinaRepository para tipo cantina', async () => {
    jwt.verify.mockReturnValue({ id: 'c1', tipo: 'cantina', token_version: 0 });
    CantinaRepository.findById.mockResolvedValue({ id: 'c1', token_version: 0 });
    const req = { headers: { authorization: 'Bearer valid' } };
    await AuthMiddleware.verificar(req, makeRes(), next);
    expect(CantinaRepository.findById).toHaveBeenCalledWith('c1');
    expect(UsuarioRepository.findById).not.toHaveBeenCalled();
  });
});
