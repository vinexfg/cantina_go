import jwt from 'jsonwebtoken';
import Result from '../valueObjects/Result.js';

class AuthMiddleware {
  static verificar(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Result.forbidden('Token não fornecido').send(res);
    }

    const token = authHeader.split(' ')[1];

    try {
      req.usuario = jwt.verify(token, process.env.JWT_SECRET);
      return next();
    } catch {
      return Result.forbidden('Token inválido ou expirado').send(res);
    }
  }
}

export default AuthMiddleware;
