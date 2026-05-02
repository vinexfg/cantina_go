import { useState, useEffect } from 'react';
import { api } from '../api';
import Navegacao from '../components/Navegacao';
import styles from './HistoricoPage.module.css';

export function HistoricoPage() {
  const [reservas, setReservas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    api.limparReservasAntigas().catch(() => {});

    api.getHistorico(user.id)
      .then((data) => setReservas(data || []))
      .catch(() => setReservas([]))
      .finally(() => setCarregando(false));
  }, []);

  const total = reservas.reduce((acc, r) => acc + parseFloat(r.total || 0), 0);

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>

        <header className={styles.header}>
          <h1>Histórico da Semana</h1>
          <p>Pedidos entregues nos últimos 7 dias</p>
        </header>

        <section className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{reservas.length}</span>
            <span className={styles.statLabel}>Entregues</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>R$ {total.toFixed(2).replace('.', ',')}</span>
            <span className={styles.statLabel}>Total da Semana</span>
          </div>
        </section>

        <section className={styles.reservationsList}>
          {carregando && <p>Carregando...</p>}
          {!carregando && reservas.length === 0 && (
            <p className={styles.vazio}>Nenhum pedido entregue esta semana.</p>
          )}
          {reservas.map((r) => (
            <div key={r.id} className={styles.reservationCard}>
              <div className={styles.resHeader}>
                <span className={styles.userName}>{r.usuario_nome || `#${r.id}`}</span>
                <span className={styles.badge}>Entregue</span>
              </div>
              <div className={styles.resTime}>
                {r.criado_em
                  ? new Date(r.criado_em).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: '2-digit',
                    }) + ' às ' + new Date(r.criado_em).toLocaleTimeString('pt-BR', {
                      hour: '2-digit', minute: '2-digit',
                    })
                  : ''}
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
              </div>
            </div>
          ))}
        </section>

      </div>
      <Navegacao />
    </div>
  );
}
