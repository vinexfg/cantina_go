import { api } from '../api';
import Navegacao from '../components/Navegacao';
import { useReservas } from '../context/ReservasContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import styles from './ReservasPage.module.css';

export function ReservasPage() {
  const { reservas, setReservas, carregando } = useReservas();
  const { addToast } = useToast();
  const { confirm } = useConfirm();

  async function marcarEntregue(id) {
    try {
      await api.atualizarStatusReserva(id, 'concluida');
      setReservas((prev) => prev.map((r) => r.id === id ? { ...r, status: 'concluida' } : r));
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  async function cancelarPedido(id) {
    if (!await confirm('Cancelar este pedido? O cliente será notificado.')) return;
    try {
      await api.atualizarStatusReserva(id, 'cancelada');
      setReservas((prev) => prev.map((r) => r.id === id ? { ...r, status: 'cancelada' } : r));
    } catch (err) {
      addToast(err.message, 'error');
    }
  }

  const reservasFiltradas = reservas.filter((r) => r.status === 'pendente');
  const pendentesCount = reservasFiltradas.length;
  const total = reservasFiltradas.reduce((acc, r) => acc + parseFloat(r.total || 0), 0);

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
            <p style={{ color: '#64748b' }}>Nenhuma reserva pendente.</p>
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
