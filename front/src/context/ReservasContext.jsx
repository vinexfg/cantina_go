import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../api';
import { STORAGE_KEYS } from '../constants/storage';
import { tocarSom } from '../utils/audio';

const BASE = (import.meta.env.VITE_API_URL || '') + '/api';

const ReservasContext = createContext({ pendentes: 0, reservas: [], carregando: true, setReservas: () => {} });

export function ReservasProvider({ children }) {
  const [pendentes, setPendentes] = useState(0);
  const [reservas, setReservas] = useState([]);
  const [carregando, setCarregando] = useState(() => {
    if (localStorage.getItem(STORAGE_KEYS.TIPO) !== 'cantina') return false;
    return !!JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}').id;
  });
  const tituloOriginal = useRef(document.title);
  const location = useLocation();

  useEffect(() => {
    const tituloInicial = tituloOriginal.current;
    const tipo = localStorage.getItem(STORAGE_KEYS.TIPO);
    if (tipo !== 'cantina') { document.title = tituloInicial; return; }

    const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
    if (!user.id) { document.title = tituloInicial; return; }

    function atualizarTitulo(lista) {
      const count = lista.filter(r => r.status === 'pendente').length;
      setPendentes(count);
      document.title = count > 0
        ? `(${count}) novo${count > 1 ? 's' : ''} pedido${count > 1 ? 's' : ''} — Cantina`
        : tituloInicial;
    }

    function carregar() {
      api.getReservasPorCantina(user.id)
        .then(({ data }) => {
          const lista = data || [];
          setReservas(lista);
          atualizarTitulo(lista);
        })
        .catch(() => {})
        .finally(() => setCarregando(false));
    }

    carregar();

    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) return () => { document.title = tituloInicial; };

    const es = new EventSource(`${BASE}/sse?token=${encodeURIComponent(token)}`);

    // Sincroniza lista ao reconectar (ex: Render acordou)
    es.addEventListener('conectado', carregar);

    es.addEventListener('nova_reserva', (e) => {
      try {
        const nova = JSON.parse(e.data);
        tocarSom();
        setReservas(prev => {
          const atualizado = [nova, ...prev.filter(r => r.id !== nova.id)];
          atualizarTitulo(atualizado);
          return atualizado;
        });
      } catch {}
    });

    return () => {
      es.close();
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
