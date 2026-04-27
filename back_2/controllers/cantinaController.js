// Controlador para Cantinas
import cantinaModel from "../models/cantinaModel.js";

class CantinaController {
  static obterTodos(req, res) {
    const cantinas = cantinaModel.obterTodos();
    res.json(cantinas);
  }

  static obterPorId(req, res) {
    const { id } = req.params;
    const cantina = cantinaModel.obterPorId(id);
    if (cantina) {
      res.json(cantina);
    } else {
      res.status(404).json({ message: "Cantina não encontrada" });
    }
  }

  static obterPorEmail(req, res) {
    const { email } = req.params;
    const cantina = cantinaModel.obterPorEmail(email);
    if (cantina) {
      res.json(cantina);
    } else {
      res.status(404).json({ message: "Cantina não encontrada" });
    }
  }

  static criar(req, res) {
    const novaCantina = req.body;
    const cantinaCriada = cantinaModel.criar(novaCantina);
    res.status(201).json(cantinaCriada);
  }

  static atualizar(req, res) {
    const { id } = req.params;
    const atualizacoes = req.body;
    const cantinaAtualizada = cantinaModel.atualizar(id, atualizacoes);
    if (cantinaAtualizada) {
      res.json(cantinaAtualizada);
    } else {
      res.status(404).json({ message: "Cantina não encontrada" });
    }
  }

  static remover(req, res) {
    const { id } = req.params;
    const cantinaRemovida = cantinaModel.remover(id);
    if (cantinaRemovida) {
      res.json({ message: "Cantina removida", cantina: cantinaRemovida });
    } else {
      res.status(404).json({ message: "Cantina não encontrada" });
    }
  }
}

export default CantinaController;
