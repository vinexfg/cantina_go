import ProdutoRepository from '../repositories/ProdutoRepository.js';
import Produto from '../valueObjects/Produto.js';
import NotFoundException from '../exceptions/NotFoundException.js';

class ProdutoService {
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

  async obterDisponiveis() {
    const produtos = await ProdutoRepository.findDisponiveis();
    return produtos.map(row => Produto.fromRow(row).toJSON());
  }

  async obterPorCantina(cantina_id) {
    const produtos = await ProdutoRepository.findByCantina(cantina_id);
    return produtos.map(row => Produto.fromRow(row).toJSON());
  }

  async criar(dados) {
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

  async atualizar(id, dados) {
    await this.obterPorId(id);
    const produto = Produto.criar({ ...dados, id });

    await ProdutoRepository.update(id, {
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco.toJSON(),
      disponivel: produto.disponivel
    });

    return { success: true };
  }

  async remover(id) {
    await this.obterPorId(id);
    await ProdutoRepository.delete(id);
  }
}

export default new ProdutoService();
