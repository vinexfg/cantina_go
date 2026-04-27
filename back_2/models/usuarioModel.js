// Modelo para Usuários
import { hashPassword, comparePassword } from '../utils/auth.js';

class UsuarioModel {
  constructor() {
    // Simulação de dados com senhas hasheadas
    this.usuarios = [
      {
        id: "1",
        nome: "João Silva",
        email: "joao@email.com",
        senha: "$2a$10$9sMiroYNVwMtkgfveS8R.eY479qy7JCxrwpP1WeAYzXNZRgV/KWyG", // senha: "123456"
        role: "user"
      },
    ];
  }

  obterTodos() {
    // Retorna sem senha
    return this.usuarios.map(({ senha, ...usuario }) => usuario);
  }

  obterPorId(id) {
    const usuario = this.usuarios.find((u) => u.id === id);
    if (usuario) {
      const { senha, ...usuarioSemSenha } = usuario;
      return usuarioSemSenha;
    }
    return null;
  }

  obterPorEmail(email) {
    return this.usuarios.find((u) => u.email === email);
  }

  async criar(usuario) {
    try {
      // Hash da senha
      const senhaHashed = await hashPassword(usuario.senha);

      const novoUsuario = {
        ...usuario,
        id: crypto.randomUUID(),
        senha: senhaHashed,
        role: usuario.role || 'user'
      };

      this.usuarios.push(novoUsuario);

      // Retorna sem senha
      const { senha, ...usuarioSemSenha } = novoUsuario;
      return usuarioSemSenha;
    } catch (error) {
      throw new Error('Erro ao criar usuário: ' + error.message);
    }
  }

  async atualizar(id, atualizacoes) {
    const index = this.usuarios.findIndex((u) => u.id === id);
    if (index !== -1) {
      // Hash da senha se estiver sendo atualizada
      if (atualizacoes.senha) {
        atualizacoes.senha = await hashPassword(atualizacoes.senha);
      }

      this.usuarios[index] = { ...this.usuarios[index], ...atualizacoes };

      // Retorna sem senha
      const { senha, ...usuarioSemSenha } = this.usuarios[index];
      return usuarioSemSenha;
    }
    return null;
  }

  async atualizarPorEmail(email, atualizacoes) {
    const index = this.usuarios.findIndex((u) => u.email === email);
    if (index !== -1) {
      // Hash da senha se estiver sendo atualizada
      if (atualizacoes.senha) {
        atualizacoes.senha = await hashPassword(atualizacoes.senha);
      }

      this.usuarios[index] = { ...this.usuarios[index], ...atualizacoes };

      // Retorna sem senha
      const { senha, ...usuarioSemSenha } = this.usuarios[index];
      return usuarioSemSenha;
    }
    return null;
  }

  remover(id) {
    const index = this.usuarios.findIndex((u) => u.id === id);
    if (index !== -1) {
      const usuarioRemovido = this.usuarios.splice(index, 1)[0];
      const { senha, ...usuarioSemSenha } = usuarioRemovido;
      return usuarioSemSenha;
    }
    return null;
  }

  // Método de autenticação
  async autenticar(email, senha) {
    try {
      const usuario = this.obterPorEmail(email);
      if (!usuario) {
        return { success: false, message: "Usuário não encontrado" };
      }

      const senhaValida = await comparePassword(senha, usuario.senha);
      if (!senhaValida) {
        return { success: false, message: "Senha incorreta" };
      }

      // Retorna dados para o token (sem senha)
      const { senha: _, ...dadosToken } = usuario;
      return { success: true, data: dadosToken };
    } catch (error) {
      console.error("Erro na autenticação:", error);
      return { success: false, message: "Erro interno do servidor" };
    }
  }
}

export default new UsuarioModel();
