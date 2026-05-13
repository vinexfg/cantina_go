import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../repositories/ReservaRepository.js', () => ({
  default: {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByCantina: vi.fn(),
    findByUsuario: vi.fn(),
    findItensByReserva: vi.fn().mockResolvedValue([]),
    findItensByReservas: vi.fn(),
    findHistoricoByCantina: vi.fn(),
    createComItens: vi.fn(),
    updateStatus: vi.fn(),
    delete: vi.fn(),
    deleteAntigasByCantina: vi.fn(),
    deleteAntigasUsuario: vi.fn(),
  }
}));

vi.mock('../../repositories/ProdutoRepository.js', () => ({
  default: {
    findById: vi.fn(),
  }
}));

vi.mock('../../repositories/CantinaRepository.js', () => ({
  default: { findById: vi.fn() }
}));

vi.mock('../../sse/SseManager.js', () => ({
  default: { emit: vi.fn() }
}));

vi.mock('../../repositories/UsuarioRepository.js', () => ({
  default: { findById: vi.fn().mockResolvedValue({ id: 'a47ac10b-58cc-4372-a567-0e02b2c3d480', email: 'aluno@escola.br' }) }
}));


vi.mock('../../services/EmailService.js', () => ({
  default: { enviarStatusReserva: vi.fn().mockResolvedValue(undefined) }
}));

import ReservaRepository from '../../repositories/ReservaRepository.js';
import ProdutoRepository from '../../repositories/ProdutoRepository.js';
import CantinaRepository from '../../repositories/CantinaRepository.js';
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
    ReservaRepository.findItensByReservas.mockResolvedValue([rowItem]);
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
    ReservaRepository.findItensByReservas.mockResolvedValue([rowItem]);
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

const rowProduto = {
  id: produtoId,
  cantina_id: cantinaId,
  nome: 'Pastel',
  preco: 5.5,
  disponivel: true,
  arquivado: false,
  quantidade_limite: null,
};

const rowItemCriado = {
  id: 'd47ac10b-58cc-4372-a567-0e02b2c3d483',
  reserva_id: reservaId,
  produto_id: produtoId,
  quantidade: 2,
};

const dadosCriar = {
  cantina_id: cantinaId,
  usuario_id: usuarioId,
  itens: [{ produto_id: produtoId, quantidade: 2 }],
};

const rowCantina = { id: cantinaId, nome: 'Cantina A', horario_abertura: null, horario_fechamento: null };

describe('ReservaService.criar', () => {
  it('cria reserva com itens válidos', async () => {
    CantinaRepository.findById.mockResolvedValue(rowCantina);
    ProdutoRepository.findById.mockResolvedValue(rowProduto);
    ReservaRepository.createComItens.mockResolvedValue({ reserva: rowReserva, itens: [rowItemCriado] });
    const result = await ReservaService.criar(dadosCriar, usuarioAluno);
    expect(ReservaRepository.createComItens).toHaveBeenCalledOnce();
    expect(result).toHaveProperty('status', 'pendente');
  });

  it('lança ForbiddenException para usuário diferente do dono', async () => {
    const outro = { id: 'ffffffff-ffff-4372-a567-0e02b2c3d000', tipo: 'usuario' };
    await expect(ReservaService.criar(dadosCriar, outro)).rejects.toThrow(ForbiddenException);
  });

  it('lança ValidationException quando produto não existe', async () => {
    CantinaRepository.findById.mockResolvedValue(rowCantina);
    ProdutoRepository.findById.mockResolvedValue(null);
    await expect(ReservaService.criar(dadosCriar, usuarioAluno)).rejects.toThrow(ValidationException);
  });

  it('lança ValidationException quando produto é de outra cantina', async () => {
    CantinaRepository.findById.mockResolvedValue(rowCantina);
    ProdutoRepository.findById.mockResolvedValue({ ...rowProduto, cantina_id: 'outra-cantina-id' });
    await expect(ReservaService.criar(dadosCriar, usuarioAluno)).rejects.toThrow(ValidationException);
  });

  it('lança ValidationException quando produto está indisponível', async () => {
    CantinaRepository.findById.mockResolvedValue(rowCantina);
    ProdutoRepository.findById.mockResolvedValue({ ...rowProduto, disponivel: false });
    await expect(ReservaService.criar(dadosCriar, usuarioAluno)).rejects.toThrow(ValidationException);
  });

  it('lança ValidationException quando produto está arquivado', async () => {
    CantinaRepository.findById.mockResolvedValue(rowCantina);
    ProdutoRepository.findById.mockResolvedValue({ ...rowProduto, arquivado: true });
    await expect(ReservaService.criar(dadosCriar, usuarioAluno)).rejects.toThrow(ValidationException);
  });

  it('lança ValidationException quando quantidade excede o limite', async () => {
    CantinaRepository.findById.mockResolvedValue(rowCantina);
    ProdutoRepository.findById.mockResolvedValue({ ...rowProduto, quantidade_limite: 1 });
    const dados = { ...dadosCriar, itens: [{ produto_id: produtoId, quantidade: 5 }] };
    await expect(ReservaService.criar(dados, usuarioAluno)).rejects.toThrow(ValidationException);
  });

  it('aceita quantidade dentro do limite', async () => {
    CantinaRepository.findById.mockResolvedValue(rowCantina);
    ProdutoRepository.findById.mockResolvedValue({ ...rowProduto, quantidade_limite: 3 });
    ReservaRepository.createComItens.mockResolvedValue({ reserva: rowReserva, itens: [rowItemCriado] });
    const dados = { ...dadosCriar, itens: [{ produto_id: produtoId, quantidade: 3 }] };
    await expect(ReservaService.criar(dados, usuarioAluno)).resolves.toBeDefined();
  });
});

describe('ReservaService.obterHistorico', () => {
  it('retorna histórico paginado da cantina', async () => {
    ReservaRepository.findHistoricoByCantina.mockResolvedValue({ dados: [rowReserva], total: 1 });
    ReservaRepository.findItensByReservas.mockResolvedValue([rowItem]);
    const result = await ReservaService.obterHistorico(cantinaId, usuarioCantina, { page: 1, limit: 20 });
    expect(result.dados).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('lança ForbiddenException para cantina não-dona', async () => {
    await expect(
      ReservaService.obterHistorico(cantinaId, usuarioAluno)
    ).rejects.toThrow(ForbiddenException);
  });
});

describe('ReservaService.limparAntigasUsuario', () => {
  it('limpa reservas antigas do usuário dono', async () => {
    ReservaRepository.deleteAntigasUsuario.mockResolvedValue(2);
    const result = await ReservaService.limparAntigasUsuario(usuarioId, usuarioAluno);
    expect(result).toEqual({ removidas: 2 });
  });

  it('lança ForbiddenException para outro usuário', async () => {
    const outro = { id: 'ffffffff-ffff-4372-a567-0e02b2c3d000', tipo: 'usuario' };
    await expect(
      ReservaService.limparAntigasUsuario(usuarioId, outro)
    ).rejects.toThrow(ForbiddenException);
  });
});

describe('ReservaService.limparAntigas', () => {
  it('limpa reservas quando chamado por cantina', async () => {
    ReservaRepository.deleteAntigasByCantina.mockResolvedValue(3);
    const result = await ReservaService.limparAntigas(usuarioCantina);
    expect(result).toEqual({ removidas: 3 });
  });

  it('lança ForbiddenException para usuário comum', async () => {
    await expect(ReservaService.limparAntigas(usuarioAluno)).rejects.toThrow(ForbiddenException);
  });
});
