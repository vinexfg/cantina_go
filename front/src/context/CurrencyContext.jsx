import { createContext, useContext, useEffect, useState } from 'react';
import { STORAGE_KEYS } from '../constants/storage';

const CurrencyContext = createContext();

const TAXA_FALLBACK_GBP = 0.155;

export function CurrencyProvider({ children }) {
  const [moeda, setMoeda] = useState(() => localStorage.getItem(STORAGE_KEYS.MOEDA) || 'BRL');
  const [taxa, setTaxa] = useState(TAXA_FALLBACK_GBP);

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/BRL')
      .then(r => r.json())
      .then(data => { if (data?.rates?.GBP) setTaxa(data.rates.GBP); })
      .catch(() => {
        // A cotação externa é opcional; mantém a taxa fallback.
      });
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOEDA, moeda);
  }, [moeda]);

  function trocarMoeda(m) { setMoeda(m); }

  return (
    <CurrencyContext.Provider value={{ moeda, taxa, trocarMoeda }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
