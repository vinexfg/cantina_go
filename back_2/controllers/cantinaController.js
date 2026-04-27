// Controlador para Cantinas
import cantinaModel from "../models/cantinaModel.js";

class CantinaController {
  // Método de login para cantinas
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
      const resultado = await cantinaModel.autenticar(email, senha);

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
      console.error("Erro no login da cantina:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor"
      });
    }
  }

  static obterTodos(req, res) {
    try {
      const cantinas = cantinaModel.obterTodos();
      res.json({
        success: true,
        data: cantinas
      });
    } catch (error) {
      console.error("Erro ao obter cantinas:", error);
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
          message: "ID da cantina é obrigatório"
        });
      }

      const cantina = cantinaModel.obterPorId(id);
      if (cantina) {
        res.json({
          success: true,
          data: cantina
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Cantina não encontrada"
        });
      }
    } catch (error) {
      console.error("Erro ao obter cantina por ID:", error);
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
          message: "Email da cantina é obrigatório"
        });
      }

      const cantina = cantinaModel.obterPorEmail(email);
      if (cantina) {
        res.json({
          success: true,
          data: cantina
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Cantina não encontrada"
        });
      }
    } catch (error) {
      console.error("Erro ao obter cantina por email:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor"
      });
    }
  }

  static async criar(req, res) {
    try {
      const novaCantina = req.body;

      // Validação básica
      if (!novaCantina.email || !novaCantina.senha || !novaCantina.nome) {
        return res.status(400).json({
          success: false,
          message: "Email, senha e nome são obrigatórios"
        });
      }

      // Verificar se email já existe
      const cantinaExistente = cantinaModel.obterPorEmail(novaCantina.email);
      if (cantinaExistente) {
        return res.status(409).json({
          success: false,
          message: "Email já cadastrado"
        });
      }

      const cantinaCriada = await cantinaModel.criar(novaCantina);
      res.status(201).json({
        success: true,
        message: "Cantina criada com sucesso",
        data: cantinaCriada
      });
    } catch (error) {
      console.error("Erro ao criar cantina:", error);
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
          message: "ID da cantina é obrigatório"
        });
      }

      // Se estiver atualizando senha, deve ser hashada
      if (atualizacoes.senha) {
        const { hashPassword } = await import("../utils/auth.js");
        atualizacoes.senha = await hashPassword(atualizacoes.senha);
      }

      const cantinaAtualizada = cantinaModel.atualizar(id, atualizacoes);
      if (cantinaAtualizada) {
        res.json({
          success: true,
          message: "Cantina atualizada com sucesso",
          data: cantinaAtualizada
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Cantina não encontrada"
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar cantina:", error);
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
          message: "ID da cantina é obrigatório"
        });
      }

      const cantinaRemovida = cantinaModel.remover(id);
      if (cantinaRemovida) {
        res.json({
          success: true,
          message: "Cantina removida com sucesso",
          data: cantinaRemovida
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Cantina não encontrada"
        });
      }
    } catch (error) {
      console.error("Erro ao remover cantina:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor"
      });
    }
  }
}

export default CantinaController;
