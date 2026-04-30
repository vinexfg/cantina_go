import AppException from './AppException.js';
import Result from '../valueObjects/Result.js';

class NotFoundException extends AppException {
  constructor(message) {
    super(message);
    this.name = 'NotFoundException';
  }

  toResult() {
    return Result.notFound(this.message);
  }
}

export default NotFoundException;
