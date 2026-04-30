import AppException from './AppException.js';
import Result from '../valueObjects/Result.js';

class ValidationException extends AppException {
  constructor(message, fields = {}) {
    super(message);
    this.name = 'ValidationException';
    this.fields = fields;
  }

  toResult() {
    return Result.badRequest(this.message);
  }
}

export default ValidationException;
