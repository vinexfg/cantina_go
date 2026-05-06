import ValidationException from '../exceptions/ValidationException.js';

function validar(campos) {
  return (req, res, next) => {
    const erros = {};
    for (const [campo, mensagem] of Object.entries(campos)) {
      const valor = req.body[campo];
      if (valor === undefined || valor === null || valor === '') {
        erros[campo] = mensagem;
      }
    }
    if (Object.keys(erros).length > 0) {
      return next(new ValidationException('Dados inválidos', erros));
    }
    next();
  };
}

export { validar };
