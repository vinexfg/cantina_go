import AppException from '../exceptions/AppException.js';
import Result from '../valueObjects/Result.js';

class ErrorMiddleware {
  static handle(erro, req, res, next) {
    if (erro instanceof AppException) {
      return erro.toResult().send(res);
    }
    const isProd = process.env.NODE_ENV === 'production';
    if (!isProd) console.error(erro);
    return Result.internalError(isProd ? 'Erro interno do servidor' : erro.message).send(res);
  }
}

export default ErrorMiddleware;
