import express from 'express'
import { verifyToken, verifyAdmin } from '../middleware/auth.js'

const router = express.Router()

// GET todos os usuários (apenas admin)
router.get('/', verifyAdmin, (req, res) => {
  res.json({ mensagem: 'Lista de usuários' })
})

// GET usuário por ID
router.get('/:id', verifyToken, (req, res) => {
  res.json({ mensagem: `Usuário ${req.params.id}` })
})

// POST criar usuário
router.post('/', (req, res) => {
  res.status(201).json({ mensagem: 'Usuário criado' })
})

// PUT atualizar usuário
router.put('/:id', verifyToken, (req, res) => {
  res.json({ mensagem: `Usuário ${req.params.id} atualizado` })
})

// DELETE deletar usuário
router.delete('/:id', verifyAdmin, (req, res) => {
  res.json({ mensagem: `Usuário ${req.params.id} deletado` })
})

export default router
