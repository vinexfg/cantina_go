// Modelo para Produtos
class ProdutoModel {
  constructor() {
    // Simulação de dados (substitua por conexão real com DB)
    this.produtos = [
      {
        id: "1",
        nome: "Coxinha",
        descricao: "Coxinha de frango",
        preco: 6.5,
        status: "disponivel",
      },
    ];
  }

  obterTodos() {
    return this.produtos;
  }

  obterPorId(id) {
    return this.produtos.find((p) => p.id === id);
  }

  obterDisponiveis() {
    return this.produtos.filter((p) => p.status === "disponivel");
  }

  criar(produto) {
    const novoProduto = { ...produto, id: crypto.randomUUID() };
    this.produtos.push(novoProduto);
    return novoProduto;
  }

  atualizar(id, atualizacoes) {
    const index = this.produtos.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.produtos[index] = { ...this.produtos[index], ...atualizacoes };
      return this.produtos[index];
    }
    return null;
  }

  remover(id) {
    const index = this.produtos.findIndex((p) => p.id === id);
    if (index !== -1) {
      return this.produtos.splice(index, 1)[0];
    }
    return null;
  }
}

export default new ProdutoModel();
