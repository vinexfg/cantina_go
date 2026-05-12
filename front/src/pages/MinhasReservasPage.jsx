import { useState, useEffect } from 'react';
import { api } from '../api';
import Navegacao from '../components/Navegacao';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import { STORAGE_KEYS } from '../constants/storage';
import styles from './MinhasReservasPage.module.css';

const BASE = (import.meta.env.VITE_API_URL || '') + '/api';


const STATUS_LABEL = {
  pendente:   { label: 'Pendente',   cor: styles.statusPendente },
  confirmada: { label: 'Confirmada', cor: styles.statusConfirmada },
  concluida:  { label: 'Concluída',  cor: styles.statusConcluida },
  cancelada:  { label: 'Cancelada',  cor: styles.statusCancelada },
};

const POR_PAGINA = 10;

export default function MinhasReservasPage() {
  const [reservas, setReservas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [filtroStatus, setFiltroStatus] = useState('');

  const FILTROS = [
    { value: '', label: 'Todos' },
    { value: 'pendente',   label: 'Pendente'   },
    { value: 'confirmada', label: 'Confirmada' },
    { value: 'concluida',  label: 'Concluída'  },
    { value: 'cancelada',  label: 'Cancelada'  },
  ];
  const { addToast } = useToast();
  const { confirm } = useConfirm();

  const reservasFiltradas = filtroStatus ? reservas.filter(r => r.status === filtroStatus) : reservas;
  const totalPaginas = Math.ceil(reservasFiltradas.length / POR_PAGINA);
  const paginadas = reservasFiltradas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
    if (!user.id) return;

    api.limparReservasAntigasUsuario(user.id).catch(() => {});

    api.getReservasPorUsuario(user.id)
      .then(({ data }) => setReservas(data || []))
      .catch(() => addToast('Erro ao carregar pedidos.', 'error'))
      .finally(() => setCarregando(false));

    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) return;

    const es = new EventSource(`${BASE}/sse?token=${encodeURIComponent(token)}`);

    es.addEventListener('status_atualizado', (e) => {
      try {
        const { id, status } = JSON.parse(e.data);
        setReservas(prev => prev.map(r => r.id === id ? { ...r, status } : r));
        const label = STATUS_LABEL[status]?.label;
        if (label) addToast(`Pedido atualizado para: ${label}`, status === 'concluida' ? 'success' : status === 'cancelada' ? 'error' : 'info', 8000);
      } catch {}
    });

    return () => es.close();
  }, [addToast]);

  async function cancelar(id) {
    if (!await confirm('Cancelar esta reserva?')) return;
    try {
      await api.removerReserva(id);
      setReservas((prev) => prev.filter((r) => r.id !== id));
      addToast('Reserva cancelada.', 'info');
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>

        <header className={styles.header}>
          <h1>Meus Pedidos</h1>
          <p>Acompanhe suas reservas</p>
        </header>

        <div className={styles.filtros}>
          {FILTROS.map(f => (
            <button
              key={f.value}
              className={`${styles.filtroBtn} ${filtroStatus === f.value ? styles.filtroAtivo : ''}`}
              onClick={() => { setFiltroStatus(f.value); setPagina(1); }}
            >{f.label}</button>
          ))}
        </div>

        {carregando && Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={`${styles.card} ${styles.skeletonCard}`}>
            <div className={styles.cardHeader}>
              <div className={`${styles.skeletonBlock} ${styles.skeletonStatus}`} />
              <div className={`${styles.skeletonBlock} ${styles.skeletonData}`} />
            </div>
            <div className={styles.skeletonItens}>
              <div className={`${styles.skeletonBlock} ${styles.skeletonItem}`} />
              <div className={`${styles.skeletonBlock} ${styles.skeletonItem}`} style={{ width: '60%' }} />
            </div>
            <div className={styles.cardFooter}>
              <div className={`${styles.skeletonBlock} ${styles.skeletonTotal}`} />
            </div>
          </div>
        ))}

        {!carregando && reservasFiltradas.length === 0 && reservas.length > 0 && (
          <p className={styles.info}>Nenhuma reserva com esse status.</p>
        )}
        {!carregando && reservas.length === 0 && (
          <div className={styles.vazio}>
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={styles.vazioIcon}>
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
            </svg>
            <p>Você ainda não fez nenhuma reserva.</p>
          </div>
        )}

        <div className={styles.lista}>
          {paginadas.map((r) => {
            const info = STATUS_LABEL[r.status] || STATUS_LABEL.pendente;
            return (
              <div key={r.id} className={styles.card}>

                <div className={styles.cardHeader}>
                  <span className={`${styles.status} ${info.cor}`}>{info.label}</span>
                  <span className={styles.data}>
                    {r.criado_em
                      ? new Date(r.criado_em).toLocaleDateString('pt-BR', {
                          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                        })
                      : ''}
                  </span>
                </div>

                <div className={styles.itensList}>
                  {(r.itens || []).map((item, i) => (
                    <div key={i} className={styles.itemRow}>
                      <span>{item.quantidade}x {item.produto_nome}</span>
                      <span className={styles.itemPreco}>
                        R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.total}>
                    Total: <strong>R$ {parseFloat(r.total || 0).toFixed(2).replace('.', ',')}</strong>
                  </span>
                  {r.status === 'pendente' && (
                    <button className={styles.btnCancelar} onClick={() => cancelar(r.id)}>
                      Cancelar
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {totalPaginas > 1 && (
          <div className={styles.paginacao}>
            <button
              className={styles.paginaBtn}
              onClick={() => setPagina(p => Math.max(1, p - 1))}
              disabled={pagina === 1}
            >‹</button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                className={`${styles.paginaBtn} ${n === pagina ? styles.paginaAtiva : ''}`}
                onClick={() => setPagina(n)}
              >{n}</button>
            ))}
            <button
              className={styles.paginaBtn}
              onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas}
            >›</button>
          </div>
        )}

      </div>
      <Navegacao />
    </div>
  );
}
