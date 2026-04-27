import cantinaModel from "../models/cantinaModel.js";

class CantinaController {
  static async obterTodos(req, res) {
    const cantinas = await cantinaModel.obterTodos();
    res.json(cantinas);
  }

  static async obterPorId(req, res) {
    const { id } = req.params;
    const cantina = await cantinaModel.obterPorId(id);

    if (cantina) {
      res.json(cantina);
    } else {
      res.status(404).json({ message: "Cantina não encontrada" });
    }
  }

  static async obterPorEmail(req, res) {
    const { email } = req.params;
    const cantina = await cantinaModel.obterPorEmail(email);

    if (cantina) {
      res.json(cantina);
    } else {
      res.status(404).json({ message: "Cantina não encontrada" });
    }
  }

  static async criar(req, res) {
    const novaCantina = req.body;
    const cantinaCriada = await cantinaModel.criar(novaCantina);
    res.status(201).json(cantinaCriada);
  }

  static async atualizar(req, res) {
    const { id } = req.params;
    const atualizacoes = req.body;

    const atualizado = await cantinaModel.atualizar(id, atualizacoes);

    if (atualizado) {
      res.json({ message: "Cantina atualizada" });
    } else {
      res.status(404).json({ message: "Cantina não encontrada" });
    }
  }

  static async remover(req, res) {
    const { id } = req.params;

    const removido = await cantinaModel.remover(id);

    if (removido) {
      res.json({ message: "Cantina removida" });
    } else {
      res.status(404).json({ message: "Cantina não encontrada" });
    }
  }
}

export default CantinaController;