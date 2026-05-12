import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../repositories/UsuarioRepository.js', () => ({
  default: {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    incrementTokenVersion: vi.fn(),
  }
}));

vi.mock('bcrypt', () => ({
  default: { hash: vi.fn(), compare: vi.fn() }
}));

import UsuarioRepository from '../../repositories/UsuarioRepository.js';
import bcrypt from 'bcrypt';
import UsuarioService from '../../services/UsuarioService.js';
import ForbiddenException from '../../exceptions/ForbiddenException.js';
import NotFoundException from '../../exceptions/NotFoundException.js';
import ValidationException from '../../exceptions/ValidationException.js';

const usuarioId = 'a47ac10b-58cc-4372-a567-0e02b2c3d480';
const dono = { id: usuarioId, tipo: 'usuario' };
const outro = { id: 'aaaaaaaa-bbbb-4372-a567-0e02b2c3d000', tipo: 'usuario' };

const rowUsuario = {
  id: usuarioId,
  nome: 'João Silva',
  email: 'joao@escola.br',
  senha: '$hashed',
  token_version: 0,
};

beforeEach(() => { vi.clearAllMocks(); });

describe('UsuarioService.obterTodos', () => {
  it('retorna lista de usuários sem senha', async () => {
    UsuarioRepository.findAll.mockResolvedValue([rowUsuario]);
    const lista = await UsuarioService.obterTodos();
    expect(lista).toHaveLength(1);
    expect(lista[0]).not.toHaveProperty('senha');
  });
});

describe('UsuarioService.obterPorId', () => {
  it('retorna usuário existente', async () => {
    UsuarioRepository.findById.mockResolvedValue(rowUsuario);
    const result = await UsuarioService.obterPorId(usuarioId, dono);
    expect(result).toHaveProperty('nome', 'João Silva');
  });

  it('lança NotFoundException quando usuário não existe', async () => {
    UsuarioRepository.findById.mockResolvedValue(null);
    await expect(UsuarioService.obterPorId(usuarioId, dono)).rejects.toThrow(NotFoundException);
  });
});

describe('UsuarioService.obterPorEmail', () => {
  it('retorna usuário pelo email', async () => {
    UsuarioRepository.findByEmail.mockResolvedValue(rowUsuario);
    const result = await UsuarioService.obterPorEmail('joao@escola.br');
    expect(result).toHaveProperty('email', 'joao@escola.br');
  });

  it('lança NotFoundException quando email não existe', async () => {
    UsuarioRepository.findByEmail.mockResolvedValue(null);
    await expect(UsuarioService.obterPorEmail('x@x.com')).rejects.toThrow(NotFoundException);
  });
});

describe('UsuarioService.criar', () => {
  it('cria usuário com senha hasheada', async () => {
    bcrypt.hash.mockResolvedValue('$hash_novo');
    UsuarioRepository.create.mockResolvedValue(rowUsuario);
    await UsuarioService.criar({ nome: 'Novo', email: 'novo@escola.br', senha: 'Senha123' });
    expect(bcrypt.hash).toHaveBeenCalledWith('Senha123', 10);
  });
});

describe('UsuarioService.atualizar', () => {
  it('atualiza usuário com senha atual correta', async () => {
    UsuarioRepository.findById.mockResolvedValue(rowUsuario);
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue('$novo_hash');
    UsuarioRepository.update.mockResolvedValue(true);
    UsuarioRepository.incrementTokenVersion.mockResolvedValue(1);

    const result = await UsuarioService.atualizar(usuarioId, {
      nome: 'Atualizado', email: 'novo@escola.br', senha: 'NovaSenha1', senha_atual: 'velha'
    }, dono);
    expect(result).toEqual({ success: true });
  });

  it('lança ForbiddenException para não-dono', async () => {
    await expect(
      UsuarioService.atualizar(usuarioId, {}, outro)
    ).rejects.toThrow(ForbiddenException);
  });

  it('lança ForbiddenException quando senha atual está errada', async () => {
    UsuarioRepository.findById.mockResolvedValue(rowUsuario);
    bcrypt.compare.mockResolvedValue(false);
    await expect(
      UsuarioService.atualizar(usuarioId, { senha_atual: 'errada', nome: 'X', email: 'x@escola.br', senha: 'NovaSenha1' }, dono)
    ).rejects.toThrow(ForbiddenException);
  });

  it('lança ValidationException quando senha_atual está ausente', async () => {
    UsuarioRepository.findById.mockResolvedValue(rowUsuario);
    await expect(
      UsuarioService.atualizar(usuarioId, { nome: 'X', email: 'x@escola.br', senha: 'NovaSenha1' }, dono)
    ).rejects.toThrow(ValidationException);
  });
});

describe('UsuarioService.remover', () => {
  it('remove usuário quando dono solicita', async () => {
    UsuarioRepository.findById.mockResolvedValue(rowUsuario);
    UsuarioRepository.delete.mockResolvedValue(true);
    await UsuarioService.remover(usuarioId, dono);
    expect(UsuarioRepository.delete).toHaveBeenCalledWith(usuarioId);
  });

  it('lança ForbiddenException para não-dono', async () => {
    await expect(UsuarioService.remover(usuarioId, outro)).rejects.toThrow(ForbiddenException);
  });

  it('lança NotFoundException quando usuário não existe', async () => {
    UsuarioRepository.findById.mockResolvedValue(null);
    await expect(UsuarioService.remover(usuarioId, dono)).rejects.toThrow(NotFoundException);
  });
});
