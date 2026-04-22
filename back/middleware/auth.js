import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.id
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' })
  }
}

export const verifyAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    req.userId = decoded.id
    req.userRole = decoded.role
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' })
  }
}
