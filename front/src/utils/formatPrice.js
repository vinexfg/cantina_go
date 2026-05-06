export function formatPrice(valor, moeda, taxa) {
  const num = parseFloat(valor) || 0;
  if (moeda === 'GBP') {
    return `£${(num * taxa).toFixed(2)}`;
  }
  return `R$ ${num.toFixed(2).replace('.', ',')}`;
}
