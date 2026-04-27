import usuarioModel from "../models/usuarioModel.js";

class UsuarioController {
  static async obterTodos(req, res) {
    const usuarios = await usuarioModel.obterTodos();
    res.json(usuarios);
  }

  static async obterPorId(req, res) {
    const { id } = req.params;
    const usuario = await usuarioModel.obterPorId(id);

    if (usuario) {
      res.json(usuario);
    } else {
      res.status(404).json({ message: "Usuário não encontrado" });
    }
  }

  static async obterPorEmail(req, res) {
    const { email } = req.params;
    const usuario = await usuarioModel.obterPorEmail(email);

    if (usuario) {
      res.json(usuario);
    } else {
      res.status(404).json({ message: "Usuário não encontrado" });
    }
  }

  static async criar(req, res) {
    const novoUsuario = req.body;
    const usuarioCriado = await usuarioModel.criar(novoUsuario);
    res.status(201).json(usuarioCriado);
  }

  static async atualizar(req, res) {
    const { id } = req.params;
    const atualizacoes = req.body;

    const atualizado = await usuarioModel.atualizar(id, atualizacoes);

    if (atualizado) {
      res.json({ message: "Usuário atualizado" });
    } else {
      res.status(404).json({ message: "Usuário não encontrado" });
    }
  }

  static async atualizarPorEmail(req, res) {
    const { email } = req.params;
    const atualizacoes = req.body;

    const atualizado = await usuarioModel.atualizarPorEmail(
      email,
      atualizacoes
    );

    if (atualizado) {
      res.json({ message: "Usuário atualizado" });
    } else {
      res.status(404).json({ message: "Usuário não encontrado" });
    }
  }

  static async remover(req, res) {
    const { id } = req.params;

    const removido = await usuarioModel.remover(id);

    if (removido) {
      res.json({ message: "Usuário removido" });
    } else {
      res.status(404).json({ message: "Usuário não encontrado" });
    }
  }
}

export default UsuarioController;