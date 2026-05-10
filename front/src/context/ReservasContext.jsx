import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../api';
import { STORAGE_KEYS } from '../constants/storage';
import { POLLING_INTERVAL } from '../constants/app';
import { tocarSom } from '../utils/audio';

const ReservasContext = createContext({ pendentes: 0, reservas: [], carregando: true, setReservas: () => {} });

export function ReservasProvider({ children }) {
  const [pendentes, setPendentes] = useState(0);
  const [reservas, setReservas] = useState([]);
  const [carregando, setCarregando] = useState(() => {
    if (localStorage.getItem(STORAGE_KEYS.TIPO) !== 'cantina') return false;
    return !!JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}').id;
  });
  const anteriorRef = useRef(null);
  const tituloOriginal = useRef(document.title);
  const location = useLocation();

  useEffect(() => {
    const tituloInicial = tituloOriginal.current;
    const tipo = localStorage.getItem(STORAGE_KEYS.TIPO);

    if (tipo !== 'cantina') {
      anteriorRef.current = null;
      document.title = tituloInicial;
      return;
    }

    const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
    if (!user.id) {
      anteriorRef.current = null;
      document.title = tituloInicial;
      return;
    }

    function checar() {
      api.getReservasPorCantina(user.id)
        .then(({ data }) => {
          const lista = data || [];
          const count = lista.filter((r) => r.status === 'pendente').length;

          if (anteriorRef.current !== null && count > anteriorRef.current) {
            tocarSom();
          }

          anteriorRef.current = count;
          setPendentes(count);
          setReservas(lista);

          document.title = count > 0
            ? `(${count}) novo${count > 1 ? 's' : ''} pedido${count > 1 ? 's' : ''} — Cantina`
            : tituloOriginal.current;
        })
        .catch(() => {
          // Falhas temporárias de polling não devem interromper a tela.
        })
        .finally(() => setCarregando(false));
    }

    checar();
    const intervalo = setInterval(checar, POLLING_INTERVAL);

    return () => {
      clearInterval(intervalo);
      document.title = tituloInicial;
    };
  }, [location.pathname]);

  return (
    <ReservasContext.Provider value={{ pendentes, reservas, setReservas, carregando }}>
      {children}
    </ReservasContext.Provider>
  );
}

export function useReservas() {
  return useContext(ReservasContext);
}

export const usePendentes = useReservas;
