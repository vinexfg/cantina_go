import express from 'express'
import { verifyToken, verifyAdmin } from '../middleware/auth.js'

const router = express.Router()

// GET todos os produtos
router.get('/', (req, res) => {
  res.json({ mensagem: 'Lista de produtos' })
})

// GET produto por ID
router.get('/:id', (req, res) => {
  res.json({ mensagem: `Produto ${req.params.id}` })
})

// POST criar produto (apenas admin)
router.post('/', verifyAdmin, (req, res) => {
  res.status(201).json({ mensagem: 'Produto criado' })
})

// PUT atualizar produto (apenas admin)
router.put('/:id', verifyAdmin, (req, res) => {
  res.json({ mensagem: `Produto ${req.params.id} atualizado` })
})

// DELETE deletar produto (apenas admin)
router.delete('/:id', verifyAdmin, (req, res) => {
  res.json({ mensagem: `Produto ${req.params.id} deletado` })
})

export default router
