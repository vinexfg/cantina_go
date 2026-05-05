import AppException from './AppException.js';
import Result from '../valueObjects/Result.js';

class ForbiddenException extends AppException {
  constructor(message = 'Acesso negado') {
    super(message);
    this.name = 'ForbiddenException';
  }

  toResult() {
    return Result.forbidden(this.message);
  }
}

export default ForbiddenException;
