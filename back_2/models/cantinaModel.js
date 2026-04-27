// Modelo para Cantinas
import { hashPassword, comparePassword } from '../utils/auth.js';

class CantinaModel {
  constructor() {
    // Simulação de dados com senhas hasheadas
    this.cantinas = [
      {
        id: "1",
        nome: "Cantina Central",
        email: "cantina@email.com",
        senha: "$2a$10$9sMiroYNVwMtkgfveS8R.eY479qy7JCxrwpP1WeAYzXNZRgV/KWyG", // senha: "123456"
        role: "admin"
      },
    ];
  }

  obterTodos() {
    // Retorna sem senha
    return this.cantinas.map(({ senha, ...cantina }) => cantina);
  }

  obterPorId(id) {
    const cantina = this.cantinas.find((c) => c.id === id);
    if (cantina) {
      const { senha, ...cantinaSemSenha } = cantina;
      return cantinaSemSenha;
    }
    return null;
  }

  obterPorEmail(email) {
    return this.cantinas.find((c) => c.email === email);
  }

  async criar(cantina) {
    try {
      // Hash da senha
      const senhaHashed = await hashPassword(cantina.senha);

      const novaCantina = {
        ...cantina,
        id: crypto.randomUUID(),
        senha: senhaHashed,
        role: cantina.role || 'admin'
      };

      this.cantinas.push(novaCantina);

      // Retorna sem senha
      const { senha, ...cantinaSemSenha } = novaCantina;
      return cantinaSemSenha;
    } catch (error) {
      throw new Error('Erro ao criar cantina: ' + error.message);
    }
  }

  async atualizar(id, atualizacoes) {
    const index = this.cantinas.findIndex((c) => c.id === id);
    if (index !== -1) {
      // Hash da senha se estiver sendo atualizada
      if (atualizacoes.senha) {
        atualizacoes.senha = await hashPassword(atualizacoes.senha);
      }

      this.cantinas[index] = { ...this.cantinas[index], ...atualizacoes };

      // Retorna sem senha
      const { senha, ...cantinaSemSenha } = this.cantinas[index];
      return cantinaSemSenha;
    }
    return null;
  }

  remover(id) {
    const index = this.cantinas.findIndex((c) => c.id === id);
    if (index !== -1) {
      const cantinaRemovida = this.cantinas.splice(index, 1)[0];
      const { senha, ...cantinaSemSenha } = cantinaRemovida;
      return cantinaSemSenha;
    }
    return null;
  }

  // Método de autenticação
  async autenticar(email, senha) {
    try {
      const cantina = this.obterPorEmail(email);
      if (!cantina) {
        return { success: false, message: "Cantina não encontrada" };
      }

      const senhaValida = await comparePassword(senha, cantina.senha);
      if (!senhaValida) {
        return { success: false, message: "Senha incorreta" };
      }

      // Retorna dados para o token (sem senha)
      const { senha: _, ...dadosToken } = cantina;
      return { success: true, data: dadosToken };
    } catch (error) {
      console.error("Erro na autenticação:", error);
      return { success: false, message: "Erro interno do servidor" };
    }
  }
}

export default new CantinaModel();
