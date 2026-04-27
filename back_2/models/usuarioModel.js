// Modelo para Usuários
class UsuarioModel {
  constructor() {
    // Simulação de dados
    this.usuarios = [
      { id: "1", nome: "João Silva", email: "joao@email.com", senha: "123456" },
    ];
  }

  obterTodos() {
    return this.usuarios;
  }

  obterPorId(id) {
    return this.usuarios.find((u) => u.id === id);
  }

  obterPorEmail(email) {
    return this.usuarios.find((u) => u.email === email);
  }

  criar(usuario) {
    const novoUsuario = { ...usuario, id: crypto.randomUUID() };
    this.usuarios.push(novoUsuario);
    return novoUsuario;
  }

  atualizar(id, atualizacoes) {
    const index = this.usuarios.findIndex((u) => u.id === id);
    if (index !== -1) {
      this.usuarios[index] = { ...this.usuarios[index], ...atualizacoes };
      return this.usuarios[index];
    }
    return null;
  }

  atualizarPorEmail(email, atualizacoes) {
    const index = this.usuarios.findIndex((u) => u.email === email);
    if (index !== -1) {
      this.usuarios[index] = { ...this.usuarios[index], ...atualizacoes };
      return this.usuarios[index];
    }
    return null;
  }

  remover(id) {
    const index = this.usuarios.findIndex((u) => u.id === id);
    if (index !== -1) {
      return this.usuarios.splice(index, 1)[0];
    }
    return null;
  }
}

export default new UsuarioModel();
