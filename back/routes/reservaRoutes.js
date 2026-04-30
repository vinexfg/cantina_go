import express from 'express';
const router = express.Router();
import ReservaController from '../controllers/reservaController.js';

// GET /api/reservas - Listar todas
router.get('/', ReservaController.obterTodos);

// GET /api/reservas/cantina/:cantina_id - Listar por cantina
router.get('/cantina/:cantina_id', ReservaController.obterPorCantina);

// GET /api/reservas/usuario/:usuario_id - Listar por usuário
router.get('/usuario/:usuario_id', ReservaController.obterPorUsuario);

// GET /api/reservas/:id - Buscar por ID (com itens)
router.get('/:id', ReservaController.obterPorId);

// POST /api/reservas - Criar reserva com itens
router.post('/', ReservaController.criar);

// PATCH /api/reservas/:id/status - Atualizar status
router.patch('/:id/status', ReservaController.atualizarStatus);

// DELETE /api/reservas/:id - Remover reserva
router.delete('/:id', ReservaController.remover);

export default router;
