import styles from './MenuPage.module.css';

export function MenuPage() {
  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        
        <header className={styles.header}>
          <h1>Cardápio do Dia</h1>
          <p>Selecione os itens para sua reserva</p>
        </header>

        <section className={styles.menuList}>

          <div className={styles.itemCard}>
            <div className={styles.itemInfo}>
              <h3>Coxinha de Frango</h3>
              <p>Massa de batata e recheio temperado</p>
              <span className={styles.price}>R$ 6,00</span>
            </div>
            <button type="button" className={styles.btnSelect}>
              Reservar
            </button>
          </div>


          <div className={styles.itemCard}>
            <div className={styles.itemInfo}>
              <h3>Sanduíche Natural</h3>
              <p>Frango desfiado, cenoura e maionese</p>
              <span className={styles.price}>R$ 8,50</span>
            </div>
            <button type="button" className={styles.btnSelect}>
              Reservar
            </button>
          </div>

          <div className={styles.itemCard}>
            <div className={styles.itemInfo}>
              <h3>Suco de Laranja</h3>
              <p>Copo de 300ml - 100% natural</p>
              <span className={styles.price}>R$ 5,00</span>
            </div>
            <button type="button" className={styles.btnSelect}>
              Reservar
            </button>
          </div>
        </section>

        <section className={styles.summarySection}>
          <div className={styles.summaryRow}>
            <span className={styles.totalLabel}>Total da Reserva:</span>
            <span className={styles.totalValue}>R$ 0,00</span>
          </div>
          <button type="button" className={styles.btnFinalize}>
            Confirmar Reservas
          </button>
        </section>

      </div>

    </div>
  );
}