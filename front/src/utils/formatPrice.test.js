import { describe, it, expect } from 'vitest';
import { formatPrice } from './formatPrice';

describe('formatPrice', () => {
  it('formata valor em reais com vírgula', () => {
    expect(formatPrice(5.5)).toBe('R$ 5,50');
  });

  it('formata valor zero', () => {
    expect(formatPrice(0)).toBe('R$ 0,00');
  });

  it('formata string numérica', () => {
    expect(formatPrice('12.99')).toBe('R$ 12,99');
  });

  it('trata valor inválido como zero', () => {
    expect(formatPrice(null)).toBe('R$ 0,00');
    expect(formatPrice(undefined)).toBe('R$ 0,00');
    expect(formatPrice('abc')).toBe('R$ 0,00');
  });

  it('formata em libras quando moeda é GBP', () => {
    expect(formatPrice(10, 'GBP', 0.15)).toBe('£1.50');
  });
});
