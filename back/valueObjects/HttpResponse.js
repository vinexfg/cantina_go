// Resposta HTTP genérica - Value Object
class HttpResponse {
  constructor(statusCode, data, message = null) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
  }

  static sucesso(data) {
    return new HttpResponse(200, data);
  }

  static criado(data) {
    return new HttpResponse(201, data);
  }

  static naoEncontrado(mensagem = "Recurso não encontrado") {
    return new HttpResponse(404, null, mensagem);
  }

  static erro(mensagem = "Erro no servidor") {
    return new HttpResponse(500, null, mensagem);
  }

  enviar(res) {
    if (this.message) {
      return res.status(this.statusCode).json({ message: this.message, data: this.data });
    }
    return res.status(this.statusCode).json(this.data);
  }
}

export default HttpResponse;
