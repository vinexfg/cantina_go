import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { STORAGE_KEYS } from '../constants/storage';
import { tocarSom } from '../utils/audio';

const BASE = (import.meta.env.VITE_API_URL || '') + '/api';

const NotificacoesContext = createContext({ notificacoes: [], naoLidas: 0, marcarTodasLidas: () => {}, limpar: () => {} });

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
    if (tipo !== 'usuario') return;

    const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
    if (!user.id) return;

    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) return;

    const es = new EventSource(`${BASE}/sse?token=${encodeURIComponent(token)}`);

    es.addEventListener('status_atualizado', (e) => {
      try {
        const { status } = JSON.parse(e.data);
        const info = MENSAGENS[status];
        if (info) { tocarSom(); adicionar(info.texto, info.tipo); }
      } catch {}
    });

    return () => es.close();
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
