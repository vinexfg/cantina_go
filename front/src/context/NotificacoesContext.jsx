import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../api';

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
  concluida: { texto: 'Seu pedido está pronto! Pode retirar na cantina.', tipo: 'success' },
  cancelada:  { texto: 'Seu pedido foi cancelado pela cantina.', tipo: 'error' },
};

function carregarSalvas() {
  try { return JSON.parse(localStorage.getItem('_notificacoes') || '[]'); } catch { return []; }
}

function salvar(lista) {
  localStorage.setItem('_notificacoes', JSON.stringify(lista));
}

export function NotificacoesProvider({ children }) {
  const [notificacoes, setNotificacoes] = useState(carregarSalvas);
  const statusAnterior = useRef({});
  const inicializado = useRef(false);

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
    localStorage.removeItem('_notificacoes');
  }

  useEffect(() => {
    const tipo = localStorage.getItem('tipo');
    if (tipo !== 'usuario') return;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return;

    function checar() {
      api.getReservasPorUsuario(user.id)
        .then(data => {
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
    const intervalo = setInterval(checar, 10000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <NotificacoesContext.Provider value={{ notificacoes, naoLidas, marcarTodasLidas, limpar }}>
      {children}
    </NotificacoesContext.Provider>
  );
}

export function useNotificacoes() {
  return useContext(NotificacoesContext);
}
