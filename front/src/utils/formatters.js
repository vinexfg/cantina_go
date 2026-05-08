export function formatarHora(iso) {
  try {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export function formatarData(iso) {
  try {
    return new Date(iso).toLocaleDateString('pt-BR');
  } catch {
    return '';
  }
}

export function formatarPreco(valor) {
  return `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;
}
