import styles from './ReservasPage.module.css';

export function ReservasPage() {
  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        
        <header className={styles.header}>
          <h1>Reservas de Hoje</h1>
          <p>Acompanhe e confirme as entregas</p>
        </header>

        <section className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>12</span>
            <span className={styles.statLabel}>Pendentes</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>R$ 145,00</span>
            <span className={styles.statLabel}>Total Previsto</span>
          </div>
        </section>

        <section className={styles.reservationsList}>
          {/* Card de Reserva Pendente */}
          <div className={styles.reservationCard}>
            <div className={styles.resHeader}>
              <span className={styles.userName}>João Silva</span>
              <span className={styles.resTime}>10:30</span>
            </div>
            
            <div className={styles.resContent}>
              <p>2x <strong>Coxinha de Frango</strong></p>
              <p>1x <strong>Suco de Laranja</strong></p>
            </div>

            <div className={styles.resFooter}>
              <span className={styles.resTotal}>Total: R$ 17,00</span>
              <button className={styles.btnDeliver}>Marcar Entregue</button>
            </div>
          </div>

          {/* Card de Reserva Pendente */}
          <div className={styles.reservationCard}>
            <div className={styles.resHeader}>
              <span className={styles.userName}>Maria Souza</span>
              <span className={styles.resTime}>10:45</span>
            </div>
            
            <div className={styles.resContent}>
              <p>1x <strong>Sanduíche Natural</strong></p>
            </div>

            <div className={styles.resFooter}>
              <span className={styles.resTotal}>Total: R$ 8,50</span>
              <button className={styles.btnDeliver}>Marcar Entregue</button>
            </div>
          </div>
        </section>

      </div>

    </div>
  );
}