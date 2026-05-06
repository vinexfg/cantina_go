import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../repositories/ReservaRepository.js', () => ({
  default: {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByCantina: vi.fn(),
    findByUsuario: vi.fn(),
    findItensByReserva: vi.fn(),
    findHistoricoByCantina: vi.fn(),
    createComItens: vi.fn(),
    updateStatus: vi.fn(),
    delete: vi.fn(),
    deleteAntigas: vi.fn(),
    deleteAntigasUsuario: vi.fn(),
  }
}));

vi.mock('../../repositories/ProdutoRepository.js', () => ({
  default: {
    findById: vi.fn(),
  }
}));

import ReservaRepository from '../../repositories/ReservaRepository.js';
import ProdutoRepository from '../../repositories/ProdutoRepository.js';
import ReservaService from '../../services/ReservaService.js';
import ForbiddenException from '../../exceptions/ForbiddenException.js';
import NotFoundException from '../../exceptions/NotFoundException.js';
import ValidationException from '../../exceptions/ValidationException.js';

const cantinaId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const usuarioId = 'a47ac10b-58cc-4372-a567-0e02b2c3d480';
const reservaId = 'b47ac10b-58cc-4372-a567-0e02b2c3d481';
const produtoId  = 'c47ac10b-58cc-4372-a567-0e02b2c3d482';

const usuarioCantina = { id: cantinaId, tipo: 'cantina' };
const usuarioAluno   = { id: usuarioId, tipo: 'usuario' };

const rowReserva = {
  id: reservaId,
  cantina_id: cantinaId,
  usuario_id: usuarioId,
  status: 'pendente',
  created_at: new Date(),
};

const rowItem = {
  id: 'd47ac10b-58cc-4372-a567-0e02b2c3d483',
  reserva_id: reservaId,
  produto_id: produtoId,
  quantidade: 2,
  nome_produto: 'Pastel',
  produto_nome: 'Pastel',
  preco_unitario: 5.5,
  produto_preco: '5.50',
};

beforeEach(() => { vi.clearAllMocks(); });

describe('ReservaService.obterPorCantina', () => {
  it('retorna reservas paginadas da cantina', async () => {
    ReservaRepository.findByCantina.mockResolvedValue({ dados: [rowReserva], total: 1 });
    ReservaRepository.findItensByReserva.mockResolvedValue([rowItem]);
    const result = await ReservaService.obterPorCantina(cantinaId, usuarioCantina, { page: 1, limit: 20 });
    expect(result.dados).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('lança ForbiddenException para usuário que não é dono da cantina', async () => {
    await expect(
      ReservaService.obterPorCantina(cantinaId, usuarioAluno)
    ).rejects.toThrow(ForbiddenException);
  });
});

describe('ReservaService.obterPorUsuario', () => {
  it('retorna reservas paginadas do usuário', async () => {
    ReservaRepository.findByUsuario.mockResolvedValue({ dados: [rowReserva], total: 1 });
    ReservaRepository.findItensByReserva.mockResolvedValue([rowItem]);
    const result = await ReservaService.obterPorUsuario(usuarioId, usuarioAluno, { page: 1, limit: 20 });
    expect(result.dados).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('lança ForbiddenException quando aluno tenta acessar reservas de outro', async () => {
    const outro = { id: 'f47ac10b-0000-4372-a567-0e02b2c3d999', tipo: 'usuario' };
    await expect(
      ReservaService.obterPorUsuario(usuarioId, outro)
    ).rejects.toThrow(ForbiddenException);
  });
});

describe('ReservaService.atualizarStatus', () => {
  it('atualiza status para valor válido', async () => {
    ReservaRepository.findById.mockResolvedValue(rowReserva);
    ReservaRepository.updateStatus.mockResolvedValue(true);
    const result = await ReservaService.atualizarStatus(reservaId, 'confirmada', usuarioCantina);
    expect(result).toEqual({ success: true });
    expect(ReservaRepository.updateStatus).toHaveBeenCalledWith(reservaId, 'confirmada');
  });

  it('lança ValidationException para status inválido', async () => {
    await expect(
      ReservaService.atualizarStatus(reservaId, 'invalido', usuarioCantina)
    ).rejects.toThrow(ValidationException);
  });

  it('lança NotFoundException quando reserva não existe', async () => {
    ReservaRepository.findById.mockResolvedValue(null);
    await expect(
      ReservaService.atualizarStatus(reservaId, 'confirmada', usuarioCantina)
    ).rejects.toThrow(NotFoundException);
  });
});

describe('ReservaService.remover', () => {
  it('remove reserva quando usuário dono solicita', async () => {
    ReservaRepository.findById.mockResolvedValue(rowReserva);
    ReservaRepository.delete.mockResolvedValue(true);
    await ReservaService.remover(reservaId, usuarioAluno);
    expect(ReservaRepository.delete).toHaveBeenCalledWith(reservaId);
  });

  it('lança NotFoundException quando reserva não existe', async () => {
    ReservaRepository.findById.mockResolvedValue(null);
    await expect(ReservaService.remover(reservaId, usuarioAluno)).rejects.toThrow(NotFoundException);
  });

  it('lança ForbiddenException para usuário sem acesso', async () => {
    ReservaRepository.findById.mockResolvedValue(rowReserva);
    const outro = { id: 'f47ac10b-0000-4372-a567-0e02b2c3d999', tipo: 'usuario' };
    await expect(ReservaService.remover(reservaId, outro)).rejects.toThrow(ForbiddenException);
  });
});

describe('ReservaService.limparAntigas', () => {
  it('limpa reservas quando chamado por cantina', async () => {
    ReservaRepository.deleteAntigas.mockResolvedValue(3);
    const result = await ReservaService.limparAntigas(usuarioCantina);
    expect(result).toEqual({ removidas: 3 });
  });

  it('lança ForbiddenException para usuário comum', async () => {
    await expect(ReservaService.limparAntigas(usuarioAluno)).rejects.toThrow(ForbiddenException);
  });
});
