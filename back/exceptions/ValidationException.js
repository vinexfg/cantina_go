class ValidationException extends Error {
  constructor(message, fields = {}) {
    super(message);
    this.name = 'ValidationException';
    this.fields = fields;
    this.statusCode = 400;
  }
}

export default ValidationException;
