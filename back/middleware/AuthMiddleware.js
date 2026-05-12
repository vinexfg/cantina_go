import jwt from 'jsonwebtoken';
import UsuarioRepository from '../repositories/UsuarioRepository.js';
import CantinaRepository from '../repositories/CantinaRepository.js';
import Result from '../valueObjects/Result.js';

class AuthMiddleware {
  static async verificar(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null) || req.query?.token;

    if (!token) {
      return Result.forbidden('Token não fornecido').send(res);
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const repo = payload.tipo === 'cantina' ? CantinaRepository : UsuarioRepository;
      const row = await repo.findById(payload.id);
      if (!row || (row.token_version ?? 0) !== (payload.token_version ?? 0)) {
        return Result.forbidden('Token inválido ou expirado').send(res);
      }
      req.usuario = payload;
      req.usuario.id = String(req.usuario.id);
      return next();
    } catch (err) {
      if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return Result.forbidden('Token inválido ou expirado').send(res);
      }
      return next(err);
    }
  }
}

export default AuthMiddleware;
