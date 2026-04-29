class Result {
  constructor(success, statusCode, data = null, message = null) {
    this.success = success;
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
  }

  static ok(data, message = null) {
    return new Result(true, 200, data, message);
  }

  static created(data, message = null) {
    return new Result(true, 201, data, message);
  }

  static notFound(message = 'Recurso não encontrado') {
    return new Result(false, 404, null, message);
  }

  static badRequest(message = 'Requisição inválida') {
    return new Result(false, 400, null, message);
  }

  static internalError(message = 'Erro interno do servidor') {
    return new Result(false, 500, null, message);
  }

  static conflict(message = 'Recurso já existe') {
    return new Result(false, 409, null, message);
  }

  static forbidden(message = 'Acesso negado') {
    return new Result(false, 403, null, message);
  }

  toJSON() {
    const response = {
      success: this.success,
      statusCode: this.statusCode
    };

    if (this.data !== null) {
      response.data = this.data;
    }

    if (this.message) {
      response.message = this.message;
    }

    return response;
  }

  send(res) {
    return res.status(this.statusCode).json(this.toJSON());
  }

  isSuccess() {
    return this.success;
  }

  isFailure() {
    return !this.success;
  }
}

export default Result;
