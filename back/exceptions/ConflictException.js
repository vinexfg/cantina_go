import AppException from './AppException.js';
import Result from '../valueObjects/Result.js';

class ConflictException extends AppException {
  constructor(message) {
    super(message);
    this.name = 'ConflictException';
  }

  toResult() {
    return Result.conflict(this.message);
  }
}

export default ConflictException;
