// Controlador para Usuários
import usuarioModel from "../models/usuarioModel.js";

class UsuarioController {
  // Método de login para usuários
  static async login(req, res) {
    try {
      const { email, senha } = req.body;

      // Validação básica
      if (!email || !senha) {
        return res.status(400).json({
          success: false,
          message: "Email e senha são obrigatórios"
        });
      }

      // Tentar autenticar
      const resultado = await usuarioModel.autenticar(email, senha);

      if (resultado.success) {
        res.json({
          success: true,
          message: "Login realizado com sucesso",
          data: resultado.data
        });
      } else {
        res.status(401).json({
          success: false,
          message: resultado.message
        });
      }
    } catch (error) {
      console.error("Erro no login do usuário:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor"
      });
    }
  }

  static obterTodos(req, res) {
    try {
      const usuarios = usuarioModel.obterTodos();
      res.json({
        success: true,
        data: usuarios
      });
    } catch (error) {
      console.error("Erro ao obter usuários:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor"
      });
    }
  }

  static obterPorId(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "ID do usuário é obrigatório"
        });
      }

      const usuario = usuarioModel.obterPorId(id);
      if (usuario) {
        res.json({
          success: true,
          data: usuario
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Usuário não encontrado"
        });
      }
    } catch (error) {
      console.error("Erro ao obter usuário por ID:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor"
      });
    }
  }

  static obterPorEmail(req, res) {
    try {
      const { email } = req.params;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email do usuário é obrigatório"
        });
      }

      const usuario = usuarioModel.obterPorEmail(email);
      if (usuario) {
        res.json({
          success: true,
          data: usuario
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Usuário não encontrado"
        });
      }
    } catch (error) {
      console.error("Erro ao obter usuário por email:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor"
      });
    }
  }

  static async criar(req, res) {
    try {
      const novoUsuario = req.body;

      // Validação básica
      if (!novoUsuario.email || !novoUsuario.senha || !novoUsuario.nome) {
        return res.status(400).json({
          success: false,
          message: "Email, senha e nome são obrigatórios"
        });
      }

      // Verificar se email já existe
      const usuarioExistente = usuarioModel.obterPorEmail(novoUsuario.email);
      if (usuarioExistente) {
        return res.status(409).json({
          success: false,
          message: "Email já cadastrado"
        });
      }

      const usuarioCriado = await usuarioModel.criar(novoUsuario);
      res.status(201).json({
        success: true,
        message: "Usuário criado com sucesso",
        data: usuarioCriado
      });
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor"
      });
    }
  }

  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const atualizacoes = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "ID do usuário é obrigatório"
        });
      }

      // Se estiver atualizando senha, deve ser hashada
      if (atualizacoes.senha) {
        const { hashPassword } = await import("../utils/auth.js");
        atualizacoes.senha = await hashPassword(atualizacoes.senha);
      }

      const usuarioAtualizado = usuarioModel.atualizar(id, atualizacoes);
      if (usuarioAtualizado) {
        res.json({
          success: true,
          message: "Usuário atualizado com sucesso",
          data: usuarioAtualizado
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Usuário não encontrado"
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor"
      });
    }
  }

  static async atualizarPorEmail(req, res) {
    try {
      const { email } = req.params;
      const atualizacoes = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email do usuário é obrigatório"
        });
      }

      // Se estiver atualizando senha, deve ser hashada
      if (atualizacoes.senha) {
        const { hashPassword } = await import("../utils/auth.js");
        atualizacoes.senha = await hashPassword(atualizacoes.senha);
      }

      const usuarioAtualizado = usuarioModel.atualizarPorEmail(
        email,
        atualizacoes,
      );
      if (usuarioAtualizado) {
        res.json({
          success: true,
          message: "Usuário atualizado com sucesso",
          data: usuarioAtualizado
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Usuário não encontrado"
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar usuário por email:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor"
      });
    }
  }

  static remover(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "ID do usuário é obrigatório"
        });
      }

      const usuarioRemovido = usuarioModel.remover(id);
      if (usuarioRemovido) {
        res.json({
          success: true,
          message: "Usuário removido com sucesso",
          data: usuarioRemovido
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Usuário não encontrado"
        });
      }
    } catch (error) {
      console.error("Erro ao remover usuário:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor"
      });
    }
  }
}

export default UsuarioController;
