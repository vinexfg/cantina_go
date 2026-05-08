import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../repositories/CantinaRepository.js', () => ({
  default: {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    incrementTokenVersion: vi.fn(),
  }
}));

vi.mock('bcrypt', () => ({
  default: { hash: vi.fn(), compare: vi.fn() }
}));

import CantinaRepository from '../../repositories/CantinaRepository.js';
import bcrypt from 'bcrypt';
import CantinaService from '../../services/CantinaService.js';
import ForbiddenException from '../../exceptions/ForbiddenException.js';
import NotFoundException from '../../exceptions/NotFoundException.js';
import ValidationException from '../../exceptions/ValidationException.js';

const cantinaId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const dono = { id: cantinaId, tipo: 'cantina' };
const outro = { id: 'aaaaaaaa-bbbb-4372-a567-0e02b2c3d000', tipo: 'cantina' };

const rowCantina = {
  id: cantinaId,
  nome: 'Cantina Central',
  email: 'cantina@escola.br',
  senha: '$hashed',
  token_version: 0,
};

beforeEach(() => { vi.clearAllMocks(); });

describe('CantinaService.listar', () => {
  it('retorna lista com toPublicJSON (sem email)', async () => {
    CantinaRepository.findAll.mockResolvedValue([rowCantina]);
    const lista = await CantinaService.listar();
    expect(lista).toHaveLength(1);
    expect(lista[0]).toHaveProperty('nome');
    expect(lista[0]).not.toHaveProperty('email');
  });
});

describe('CantinaService.obterPorId', () => {
  it('retorna dados completos quando o dono consulta', async () => {
    CantinaRepository.findById.mockResolvedValue(rowCantina);
    const result = await CantinaService.obterPorId(cantinaId, dono);
    expect(result).toHaveProperty('email');
  });

  it('retorna dados públicos para usuário não-dono', async () => {
    CantinaRepository.findById.mockResolvedValue(rowCantina);
    const result = await CantinaService.obterPorId(cantinaId, null);
    expect(result).not.toHaveProperty('email');
  });

  it('lança NotFoundException quando cantina não existe', async () => {
    CantinaRepository.findById.mockResolvedValue(null);
    await expect(CantinaService.obterPorId(cantinaId)).rejects.toThrow(NotFoundException);
  });
});

describe('CantinaService.criar', () => {
  it('cria cantina com senha hasheada', async () => {
    bcrypt.hash.mockResolvedValue('$hash_novo');
    CantinaRepository.create.mockResolvedValue(rowCantina);
    const result = await CantinaService.criar({
      nome: 'Nova',
      email: 'nova@escola.br',
      senha: 'Senha123',
    });
    expect(bcrypt.hash).toHaveBeenCalledWith('Senha123', 10);
    expect(result).toHaveProperty('nome');
  });
});

describe('CantinaService.atualizar', () => {
  it('atualiza cantina com senha atual correta', async () => {
    CantinaRepository.findById.mockResolvedValue(rowCantina);
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue('$novo_hash');
    CantinaRepository.update.mockResolvedValue(true);
    CantinaRepository.incrementTokenVersion.mockResolvedValue(1);

    const result = await CantinaService.atualizar(cantinaId, {
      nome: 'Atualizada', email: 'nova@escola.br', senha: 'NovaSenha1', senha_atual: 'velha'
    }, dono);
    expect(result).toEqual({ success: true });
  });

  it('lança ForbiddenException para não-dono', async () => {
    await expect(
      CantinaService.atualizar(cantinaId, {}, outro)
    ).rejects.toThrow(ForbiddenException);
  });

  it('lança ForbiddenException quando senha atual está errada', async () => {
    CantinaRepository.findById.mockResolvedValue(rowCantina);
    bcrypt.compare.mockResolvedValue(false);
    await expect(
      CantinaService.atualizar(cantinaId, { senha_atual: 'errada', nome: 'X', email: 'x@x.com', senha: 'NovaSenha1' }, dono)
    ).rejects.toThrow(ForbiddenException);
  });

  it('lança ValidationException quando senha_atual está ausente', async () => {
    CantinaRepository.findById.mockResolvedValue(rowCantina);
    await expect(
      CantinaService.atualizar(cantinaId, { nome: 'X', email: 'x@x.com', senha: 'NovaSenha1' }, dono)
    ).rejects.toThrow(ValidationException);
  });
});

describe('CantinaService.remover', () => {
  it('remove cantina quando dono solicita', async () => {
    CantinaRepository.findById.mockResolvedValue(rowCantina);
    CantinaRepository.delete.mockResolvedValue(true);
    await CantinaService.remover(cantinaId, dono);
    expect(CantinaRepository.delete).toHaveBeenCalledWith(cantinaId);
  });

  it('lança ForbiddenException para não-dono', async () => {
    await expect(CantinaService.remover(cantinaId, outro)).rejects.toThrow(ForbiddenException);
  });
});
