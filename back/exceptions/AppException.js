import Result from '../valueObjects/Result.js';

class AppException extends Error {
  toResult() {
    return Result.internalError(this.message);
  }
}

export default AppException;
