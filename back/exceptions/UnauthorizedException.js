import AppException from './AppException.js';
import Result from '../valueObjects/Result.js';

class UnauthorizedException extends AppException {
  constructor(message = 'Credenciais inválidas') {
    super(message);
    this.name = 'UnauthorizedException';
  }

  toResult() {
    return Result.unauthorized(this.message);
  }
}

export default UnauthorizedException;
