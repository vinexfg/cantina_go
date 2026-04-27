// Middleware de tratamento de erros global
const errorHandler = (err, req, res, next) => {
  console.error("Erro capturado pelo middleware:", err);

  // Erro de validação do JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: "Token JWT inválido"
    });
  }

  // Token expirado
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: "Token JWT expirado"
    });
  }

  // Erro de sintaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: "JSON malformado no corpo da requisição"
    });
  }

  // Erro de validação (ex: Joi, express-validator)
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: "Dados de entrada inválidos",
      errors: err.errors || err.details
    });
  }

  // Erro de cast do MongoDB (se estivesse usando)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: "ID inválido"
    });
  }

  // Erro padrão do servidor
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Erro interno do servidor",
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// Middleware para capturar rotas não encontradas
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Rota ${req.originalUrl} não encontrada`
  });
};

export { errorHandler, notFoundHandler };