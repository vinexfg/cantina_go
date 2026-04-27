// Controlador para Usuários
import usuarioModel from "../models/usuarioModel.js";

class UsuarioController {
  static obterTodos(req, res) {
    const usuarios = usuarioModel.obterTodos();
    res.json(usuarios);
  }

  static obterPorId(req, res) {
    const { id } = req.params;
    const usuario = usuarioModel.obterPorId(id);
    if (usuario) {
      res.json(usuario);
    } else {
      res.status(404).json({ message: "Usuário não encontrado" });
    }
  }

  static obterPorEmail(req, res) {
    const { email } = req.params;
    const usuario = usuarioModel.obterPorEmail(email);
    if (usuario) {
      res.json(usuario);
    } else {
      res.status(404).json({ message: "Usuário não encontrado" });
    }
  }

  static criar(req, res) {
    const novoUsuario = req.body;
    const usuarioCriado = usuarioModel.criar(novoUsuario);
    res.status(201).json(usuarioCriado);
  }

  static atualizar(req, res) {
    const { id } = req.params;
    const atualizacoes = req.body;
    const usuarioAtualizado = usuarioModel.atualizar(id, atualizacoes);
    if (usuarioAtualizado) {
      res.json(usuarioAtualizado);
    } else {
      res.status(404).json({ message: "Usuário não encontrado" });
    }
  }

  static atualizarPorEmail(req, res) {
    const { email } = req.params;
    const atualizacoes = req.body;
    const usuarioAtualizado = usuarioModel.atualizarPorEmail(
      email,
      atualizacoes,
    );
    if (usuarioAtualizado) {
      res.json(usuarioAtualizado);
    } else {
      res.status(404).json({ message: "Usuário não encontrado" });
    }
  }

  static remover(req, res) {
    const { id } = req.params;
    const usuarioRemovido = usuarioModel.remover(id);
    if (usuarioRemovido) {
      res.json({ message: "Usuário removido", usuario: usuarioRemovido });
    } else {
      res.status(404).json({ message: "Usuário não encontrado" });
    }
  }
}

export default UsuarioController;
