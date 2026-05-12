import jwt from 'jsonwebtoken';
import UsuarioRepository from '../repositories/UsuarioRepository.js';
import CantinaRepository from '../repositories/CantinaRepository.js';
import Result from '../valueObjects/Result.js';

class AuthMiddleware {
  static verificarChaveAdmin(req, res, next) {
    const chave = req.body.chaveAdmin;
    if (!chave || chave !== process.env.CANTINA_REGISTER_KEY) {
      return Result.forbidden('Chave administrativa inválida').send(res);
    }
    next();
  }

  static async verificar(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Result.forbidden('Token não fornecido').send(res);
    }

    const token = authHeader.split(' ')[1];

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
