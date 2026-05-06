import ProdutoRepository from '../repositories/ProdutoRepository.js';
import Produto from '../valueObjects/Produto.js';
import NotFoundException from '../exceptions/NotFoundException.js';
import ForbiddenException from '../exceptions/ForbiddenException.js';

class ProdutoService {
  validarCantinaAutenticada(usuario, cantina_id) {
    if (!usuario || usuario.tipo !== 'cantina') {
      throw new ForbiddenException('Apenas cantinas podem gerenciar produtos');
    }

    if (String(usuario.id) !== String(cantina_id)) {
      throw new ForbiddenException('Você não pode gerenciar produtos de outra cantina');
    }
  }

  async obterTodos() {
    const produtos = await ProdutoRepository.findAll();
    return produtos.map(row => Produto.fromRow(row).toJSON());
  }

  async obterPorId(id) {
    const produto = await ProdutoRepository.findById(id);
    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }
    return Produto.fromRow(produto).toJSON();
  }

  async obterDisponiveis({ page, limit } = {}) {
    const { dados, total } = await ProdutoRepository.findDisponiveis({ page, limit });
    return { dados: dados.map(row => Produto.fromRow(row).toJSON()), total };
  }

  async obterPorCantina(cantina_id, { page, limit } = {}) {
    const { dados, total } = await ProdutoRepository.findByCantina(cantina_id, { page, limit });
    return { dados: dados.map(row => Produto.fromRow(row).toJSON()), total };
  }

  async criar(dados, usuarioAutenticado = null) {
    this.validarCantinaAutenticada(usuarioAutenticado, dados.cantina_id);
    const produto = Produto.criar(dados);
    const produtoCriado = await ProdutoRepository.create({
      id: produto.id.toString(),
      cantina_id: produto.cantina_id,
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco.toJSON(),
      disponivel: produto.disponivel
    });
    return Produto.fromRow(produtoCriado).toJSON();
  }

  async atualizar(id, dados, usuarioAutenticado = null) {
    const produtoExistente = await this.obterPorId(id);
    this.validarCantinaAutenticada(usuarioAutenticado, produtoExistente.cantina_id);
    this.validarCantinaAutenticada(usuarioAutenticado, dados.cantina_id);

    const produto = Produto.criar({ ...dados, id });

    await ProdutoRepository.update(id, {
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco.toJSON(),
      disponivel: produto.disponivel,
      quantidade_limite: produto.quantidade_limite
    });

    return { success: true };
  }

  async remover(id, usuarioAutenticado = null) {
    const produto = await this.obterPorId(id);
    this.validarCantinaAutenticada(usuarioAutenticado, produto.cantina_id);
    await ProdutoRepository.delete(id);
  }
}

export default new ProdutoService();
