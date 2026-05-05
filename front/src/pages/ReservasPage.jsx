import { useState, useEffect } from 'react';
import { api } from '../api';
import Navegacao from '../components/Navegacao';
import styles from './ReservasPage.module.css';

export function ReservasPage() {
  const [reservas, setReservas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('pendente');

  const FILTROS = [
    { value: 'pendente',  label: 'Pendentes'  },
    { value: 'concluida', label: 'Concluídas' },
    { value: 'cancelada', label: 'Canceladas' },
  ];

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  function buscarReservas() {
    api.getReservasPorCantina(user.id)
      .then((data) => setReservas(data || []))
      .catch(() => {})
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    buscarReservas();
    const intervalo = setInterval(buscarReservas, 10000);
    return () => clearInterval(intervalo);
  }, []);

  async function marcarEntregue(id) {
    try {
      await api.atualizarStatusReserva(id, 'concluida');
      setReservas((prev) => prev.map((r) => r.id === id ? { ...r, status: 'concluida' } : r));
    } catch (err) {
      alert(err.message);
    }
  }

  async function cancelarPedido(id) {
    if (!confirm('Cancelar este pedido? O cliente será notificado.')) return;
    try {
      await api.atualizarStatusReserva(id, 'cancelada');
      setReservas((prev) => prev.map((r) => r.id === id ? { ...r, status: 'cancelada' } : r));
    } catch (err) {
      alert(err.message);
    }
  }

  const reservasFiltradas = reservas.filter((r) => r.status === filtroStatus);
  const pendentesCount = reservas.filter((r) => r.status === 'pendente').length;
  const total = reservas
    .filter((r) => r.status === 'pendente')
    .reduce((acc, r) => acc + parseFloat(r.total || 0), 0);

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>

        <header className={styles.header}>
          <h1>Reservas de Hoje</h1>
          <p>Acompanhe e confirme as entregas</p>
        </header>

        <section className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{pendentesCount}</span>
            <span className={styles.statLabel}>Pendentes</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>R$ {total.toFixed(2).replace('.', ',')}</span>
            <span className={styles.statLabel}>Total Previsto</span>
          </div>
        </section>

        <div className={styles.filtros}>
          {FILTROS.map(f => (
            <button
              key={f.value}
              className={`${styles.filtroBtn} ${filtroStatus === f.value ? styles.filtroAtivo : ''}`}
              onClick={() => setFiltroStatus(f.value)}
            >{f.label}</button>
          ))}
        </div>

        <section className={styles.reservationsList}>
          {carregando && Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`${styles.reservationCard} ${styles.skeletonCard}`}>
              <div className={styles.resHeader}>
                <div className={`${styles.skeletonBlock} ${styles.skeletonNome}`} />
                <div className={`${styles.skeletonBlock} ${styles.skeletonHora}`} />
              </div>
              <div className={styles.skeletonItens}>
                <div className={`${styles.skeletonBlock} ${styles.skeletonItem}`} />
                <div className={`${styles.skeletonBlock} ${styles.skeletonItem}`} style={{ width: '55%' }} />
              </div>
              <div className={styles.skeletonFooter}>
                <div className={`${styles.skeletonBlock} ${styles.skeletonTotal}`} />
                <div className={`${styles.skeletonBlock} ${styles.skeletonBtns}`} />
              </div>
            </div>
          ))}
          {!carregando && reservasFiltradas.length === 0 && (
            <p style={{ color: '#64748b' }}>Nenhuma reserva {filtroStatus === 'pendente' ? 'pendente' : filtroStatus === 'concluida' ? 'concluída' : 'cancelada'}.</p>
          )}
          {reservasFiltradas.map((r) => (
            <div key={r.id} className={styles.reservationCard}>
              <div className={styles.resHeader}>
                <span className={styles.userName}>{r.usuario_nome || `#${r.id}`}</span>
                <span className={styles.resTime}>
                  {r.criado_em ? new Date(r.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>

              <div className={styles.resContent}>
                {(r.itens || []).map((item, i) => (
                  <p key={i}>{item.quantidade}x <strong>{item.produto_nome || item.nome}</strong></p>
                ))}
              </div>

              <div className={styles.resFooter}>
                <span className={styles.resTotal}>
                  Total: R$ {parseFloat(r.total || 0).toFixed(2).replace('.', ',')}
                </span>
                <div className={styles.acoes}>
                  <button className={styles.btnCancel} onClick={() => cancelarPedido(r.id)}>
                    Cancelar
                  </button>
                  <button className={styles.btnDeliver} onClick={() => marcarEntregue(r.id)}>
                    Aceitar Reserva
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>

      </div>
      <Navegacao />
    </div>
  );
}
