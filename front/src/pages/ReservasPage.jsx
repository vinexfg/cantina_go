import { useState, useEffect } from 'react';
import { api } from '../api';
import Navegacao from '../components/Navegacao';
import styles from './ReservasPage.module.css';

export function ReservasPage() {
  const [reservas, setReservas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    api.getReservasPorCantina(user.id)
      .then((data) => setReservas(data || []))
      .catch(() => setReservas([]))
      .finally(() => setCarregando(false));
  }, []);

  async function marcarEntregue(id) {
    try {
      await api.atualizarStatusReserva(id, 'concluida');
      setReservas((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  const total = reservas.reduce((acc, r) => acc + parseFloat(r.total || 0), 0);

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>

        <header className={styles.header}>
          <h1>Reservas de Hoje</h1>
          <p>Acompanhe e confirme as entregas</p>
        </header>

        <section className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{reservas.length}</span>
            <span className={styles.statLabel}>Pendentes</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>R$ {total.toFixed(2).replace('.', ',')}</span>
            <span className={styles.statLabel}>Total Previsto</span>
          </div>
        </section>

        <section className={styles.reservationsList}>
          {carregando && <p>Carregando...</p>}
          {!carregando && reservas.length === 0 && <p style={{ color: '#64748b' }}>Nenhuma reserva pendente.</p>}
          {reservas.map((r) => (
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
                <button className={styles.btnDeliver} onClick={() => marcarEntregue(r.id)}>
                  Marcar Entregue
                </button>
              </div>
            </div>
          ))}
        </section>

      </div>
      <Navegacao />
    </div>
  );
}
