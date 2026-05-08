export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_NOME_LENGTH = 3;
export const MIN_SENHA_LENGTH = 8;

export function validarCampo(campo, valor, { emailAtual } = {}) {
  if (campo === 'nome') {
    if (!valor.trim()) return 'Nome é obrigatório';
    if (valor.trim().length < MIN_NOME_LENGTH) return `Nome deve ter pelo menos ${MIN_NOME_LENGTH} caracteres`;
  }
  if (campo === 'email') {
    if (!valor.trim()) return 'Email é obrigatório';
    if (!EMAIL_REGEX.test(valor.trim())) return 'Email inválido';
  }
  if (campo === 'confirmarEmail') {
    if (!valor.trim()) return 'Confirmação de email é obrigatória';
    if (valor !== emailAtual) return 'Os e-mails não coincidem';
  }
  if (campo === 'senha') {
    if (!valor) return 'Senha é obrigatória';
    if (valor.length < MIN_SENHA_LENGTH) return `Senha deve ter pelo menos ${MIN_SENHA_LENGTH} caracteres`;
  }
  if (campo === 'cantinaId') {
    if (!valor) return 'Selecione uma cantina';
  }
  return '';
}
