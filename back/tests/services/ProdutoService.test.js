import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../repositories/ProdutoRepository.js', () => ({
  default: {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByCantina: vi.fn(),
    findDisponiveis: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
}));

import ProdutoRepository from '../../repositories/ProdutoRepository.js';
import ProdutoService from '../../services/ProdutoService.js';
import NotFoundException from '../../exceptions/NotFoundException.js';
import ForbiddenException from '../../exceptions/ForbiddenException.js';

const cantinaId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const produtoId = 'a47ac10b-58cc-4372-a567-0e02b2c3d480';
const usuarioCantina = { id: cantinaId, tipo: 'cantina' };

const rowProduto = {
  id: produtoId,
  cantina_id: cantinaId,
  nome: 'Pastel',
  descricao: null,
  preco: '5.50',
  disponivel: true,
  quantidade_limite: null,
};

beforeEach(() => { vi.clearAllMocks(); });

describe('ProdutoService.obterPorId', () => {
  it('retorna produto existente', async () => {
    ProdutoRepository.findById.mockResolvedValue(rowProduto);
    const p = await ProdutoService.obterPorId(produtoId);
    expect(p.nome).toBe('Pastel');
    expect(ProdutoRepository.findById).toHaveBeenCalledWith(produtoId);
  });

  it('lança NotFoundException quando produto não existe', async () => {
    ProdutoRepository.findById.mockResolvedValue(null);
    await expect(ProdutoService.obterPorId('inexistente')).rejects.toThrow(NotFoundException);
  });
});

describe('ProdutoService.obterDisponiveis', () => {
  it('retorna lista paginada de produtos disponíveis', async () => {
    ProdutoRepository.findDisponiveis.mockResolvedValue({ dados: [rowProduto], total: 1 });
    const result = await ProdutoService.obterDisponiveis({ page: 1, limit: 20 });
    expect(result.dados).toHaveLength(1);
    expect(result.total).toBe(1);
  });
});

describe('ProdutoService.obterPorCantina', () => {
  it('retorna produtos da cantina paginados', async () => {
    ProdutoRepository.findByCantina.mockResolvedValue({ dados: [rowProduto], total: 1 });
    const result = await ProdutoService.obterPorCantina(cantinaId, { page: 1, limit: 50 });
    expect(result.dados).toHaveLength(1);
    expect(ProdutoRepository.findByCantina).toHaveBeenCalledWith(cantinaId, { page: 1, limit: 50 });
  });
});

describe('ProdutoService.criar', () => {
  it('cria produto quando cantina é a dona', async () => {
    ProdutoRepository.create.mockResolvedValue(rowProduto);
    const p = await ProdutoService.criar(
      { cantina_id: cantinaId, nome: 'Pastel', preco: 5.5 },
      usuarioCantina
    );
    expect(p.nome).toBe('Pastel');
    expect(ProdutoRepository.create).toHaveBeenCalledOnce();
  });

  it('lança ForbiddenException para usuário que não é cantina', async () => {
    await expect(
      ProdutoService.criar({ cantina_id: cantinaId, nome: 'X', preco: 1 }, { id: cantinaId, tipo: 'usuario' })
    ).rejects.toThrow(ForbiddenException);
  });

  it('lança ForbiddenException quando cantina tenta criar produto de outra cantina', async () => {
    const outraCantina = { id: 'outro-id-00000-00000-00000-00000000', tipo: 'cantina' };
    await expect(
      ProdutoService.criar({ cantina_id: cantinaId, nome: 'X', preco: 1 }, outraCantina)
    ).rejects.toThrow(ForbiddenException);
  });
});

describe('ProdutoService.remover', () => {
  it('remove produto quando cantina é a dona', async () => {
    ProdutoRepository.findById.mockResolvedValue(rowProduto);
    ProdutoRepository.delete.mockResolvedValue(true);
    await ProdutoService.remover(produtoId, usuarioCantina);
    expect(ProdutoRepository.delete).toHaveBeenCalledWith(produtoId);
  });

  it('lança NotFoundException quando produto não existe', async () => {
    ProdutoRepository.findById.mockResolvedValue(null);
    await expect(ProdutoService.remover('nao-existe', usuarioCantina)).rejects.toThrow(NotFoundException);
  });

  it('lança ForbiddenException quando cantina diferente tenta remover', async () => {
    ProdutoRepository.findById.mockResolvedValue(rowProduto);
    const outraCantina = { id: 'f47ac10b-0000-4372-a567-0e02b2c3d999', tipo: 'cantina' };
    await expect(ProdutoService.remover(produtoId, outraCantina)).rejects.toThrow(ForbiddenException);
  });
});
