import AppException from '../exceptions/AppException.js';
import Result from '../valueObjects/Result.js';

class ErrorMiddleware {
  static handle(erro, req, res, next) {
    if (erro instanceof AppException) {
      return erro.toResult().send(res);
    }
    return Result.internalError(erro.message).send(res);
  }
}

export default ErrorMiddleware;
