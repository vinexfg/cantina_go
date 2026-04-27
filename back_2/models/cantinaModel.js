// Modelo para Cantinas
class CantinaModel {
  constructor() {
    // Simulação de dados
    this.cantinas = [
      {
        id: "1",
        nome: "Cantina Central",
        email: "cantina@email.com",
        senha: "123456",
      },
    ];
  }

  obterTodos() {
    return this.cantinas;
  }

  obterPorId(id) {
    return this.cantinas.find((c) => c.id === id);
  }

  obterPorEmail(email) {
    return this.cantinas.find((c) => c.email === email);
  }

  criar(cantina) {
    const novaCantina = { ...cantina, id: crypto.randomUUID() };
    this.cantinas.push(novaCantina);
    return novaCantina;
  }

  atualizar(id, atualizacoes) {
    const index = this.cantinas.findIndex((c) => c.id === id);
    if (index !== -1) {
      this.cantinas[index] = { ...this.cantinas[index], ...atualizacoes };
      return this.cantinas[index];
    }
    return null;
  }

  remover(id) {
    const index = this.cantinas.findIndex((c) => c.id === id);
    if (index !== -1) {
      return this.cantinas.splice(index, 1)[0];
    }
    return null;
  }
}

export default new CantinaModel();
