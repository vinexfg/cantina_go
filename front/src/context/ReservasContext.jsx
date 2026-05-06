import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../api';

const ReservasContext = createContext({ pendentes: 0, reservas: [], carregando: true, setReservas: () => {} });

function tocarSom() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.35);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1100, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);

    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.9);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.9);

    osc1.onended = () => ctx.close();
  } catch {
    // O aviso sonoro é opcional.
  }
}

export function ReservasProvider({ children }) {
  const [pendentes, setPendentes] = useState(0);
  const [reservas, setReservas] = useState([]);
  const [carregando, setCarregando] = useState(() => {
    if (localStorage.getItem('tipo') !== 'cantina') return false;
    return !!JSON.parse(localStorage.getItem('user') || '{}').id;
  });
  const anteriorRef = useRef(null);
  const tituloOriginal = useRef(document.title);

  useEffect(() => {
    const tituloInicial = tituloOriginal.current;
    const tipo = localStorage.getItem('tipo');

    if (tipo !== 'cantina') return;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return;

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
    const intervalo = setInterval(checar, 10000);

    return () => {
      clearInterval(intervalo);
      document.title = tituloInicial;
    };
  }, []);

  return (
    <ReservasContext.Provider value={{ pendentes, reservas, setReservas, carregando }}>
      {children}
    </ReservasContext.Provider>
  );
}

export function usePendentes() {
  return useContext(ReservasContext);
}

export function useReservas() {
  return useContext(ReservasContext);
}
