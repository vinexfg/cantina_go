export const getHealth = (req, res) => {
  res.status(200).json({ status: 'ok' })
}

export const getStatus = (req, res) => {
  res.status(200).json({
    nome: 'CANTINAGO API',
    status: 'online',
    descricao: 'API para gerenciamento da CantinaGO',
    versao: '1.0.0',
    endpoints: {
      usuarios: '/usuarios',
      produtos: '/produtos',
      pedidos: '/pedidos',
      health: '/health'
    }
  })
}
