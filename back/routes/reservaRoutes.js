import express from 'express';
const router = express.Router();
import ReservaController from '../controllers/reservaController.js';
import { validar } from '../middleware/ValidationMiddleware.js';

const validarReserva = validar({ usuario_id: 'Usuário é obrigatório', cantina_id: 'Cantina é obrigatória', itens: 'Itens são obrigatórios' });
const validarStatus  = validar({ status: 'Status é obrigatório' });

// GET /api/reservas/cantina/:cantina_id - Listar por cantina
router.get('/cantina/:cantina_id', ReservaController.obterPorCantina);

// GET /api/reservas/usuario/:usuario_id - Listar por usuário
router.get('/usuario/:usuario_id', ReservaController.obterPorUsuario);

// GET /api/reservas/cantina/:cantina_id/historico - Historico da semana
router.get('/cantina/:cantina_id/historico', ReservaController.historico);

// DELETE /api/reservas/antigas - Remover concluidas com mais de 7 dias
router.delete('/antigas', ReservaController.limparAntigas);

// DELETE /api/reservas/usuario/:usuario_id/antigas - Remover pedidos antigos do usuário
router.delete('/usuario/:usuario_id/antigas', ReservaController.limparAntigasUsuario);

// GET /api/reservas/:id - Buscar por ID (com itens)
router.get('/:id', ReservaController.obterPorId);

// POST /api/reservas - Criar reserva com itens
router.post('/', validarReserva, ReservaController.criar);

// PATCH /api/reservas/:id/status - Atualizar status
router.patch('/:id/status', validarStatus, ReservaController.atualizarStatus);

// DELETE /api/reservas/:id - Remover reserva
router.delete('/:id', ReservaController.remover);

export default router;
