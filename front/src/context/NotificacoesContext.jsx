import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../api';
import { STORAGE_KEYS } from '../constants/storage';
import { POLLING_INTERVAL } from '../constants/app';

const NotificacoesContext = createContext({ notificacoes: [], naoLidas: 0, marcarTodasLidas: () => {}, limpar: () => {} });

function tocarSom() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.connect(gain); osc2.connect(gain); gain.connect(ctx.destination);
    osc1.type = 'sine'; osc1.frequency.setValueAtTime(880, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.35);
    osc2.type = 'sine'; osc2.frequency.setValueAtTime(1100, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.35);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    osc1.start(ctx.currentTime); osc1.stop(ctx.currentTime + 0.9);
    osc2.start(ctx.currentTime); osc2.stop(ctx.currentTime + 0.9);
    osc1.onended = () => ctx.close();
  } catch {
    // O aviso sonoro é opcional.
  }
}

const MENSAGENS = {
  concluida: { texto: 'Reserva aceita com sucesso! Pedido reservado.', tipo: 'success' },
  cancelada:  { texto: 'Seu pedido foi cancelado pela cantina.', tipo: 'error' },
};

function carregarSalvas() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICACOES) || '[]'); } catch { return []; }
}

function salvar(lista) {
  localStorage.setItem(STORAGE_KEYS.NOTIFICACOES, JSON.stringify(lista));
}

export function NotificacoesProvider({ children }) {
  const [notificacoes, setNotificacoes] = useState(carregarSalvas);
  const statusAnterior = useRef({});
  const inicializado = useRef(false);
  const location = useLocation();

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  function adicionar(mensagem, tipo) {
    const nova = { id: Date.now() + Math.random(), mensagem, tipo, hora: new Date().toISOString(), lida: false };
    setNotificacoes(prev => {
      const atualizado = [nova, ...prev].slice(0, 30);
      salvar(atualizado);
      return atualizado;
    });
  }

  function marcarTodasLidas() {
    setNotificacoes(prev => {
      const atualizado = prev.map(n => ({ ...n, lida: true }));
      salvar(atualizado);
      return atualizado;
    });
  }

  function limpar() {
    setNotificacoes([]);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICACOES);
  }

  useEffect(() => {
    const tipo = localStorage.getItem(STORAGE_KEYS.TIPO);
    if (tipo !== 'usuario') {
      statusAnterior.current = {};
      inicializado.current = false;
      return;
    }

    const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
    if (!user.id) {
      statusAnterior.current = {};
      inicializado.current = false;
      return;
    }

    function checar() {
      api.getReservasPorUsuario(user.id)
        .then(({ data }) => {
          const lista = data || [];
          lista.forEach(r => {
            const anterior = statusAnterior.current[r.id];
            if (inicializado.current && anterior && anterior !== r.status) {
              const info = MENSAGENS[r.status];
              if (info) {
                tocarSom();
                adicionar(info.texto, info.tipo);
              }
            }
            statusAnterior.current[r.id] = r.status;
          });
          if (!inicializado.current) inicializado.current = true;
        })
        .catch(() => {
          // Falhas temporárias de polling não devem interromper a tela.
        });
    }

    checar();
    const intervalo = setInterval(checar, POLLING_INTERVAL);
    return () => clearInterval(intervalo);
  }, [location.pathname]);

  return (
    <NotificacoesContext.Provider value={{ notificacoes, naoLidas, marcarTodasLidas, limpar }}>
      {children}
    </NotificacoesContext.Provider>
  );
}

export function useNotificacoes() {
  return useContext(NotificacoesContext);
}
