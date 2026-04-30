import styles from './VendedorPage.module.css';

export default function VendedorPage() {
  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        
        <header className={styles.header}>
          <h1>Gestão do Dia</h1>
          <p>Ative os itens disponíveis ou cadastre novos</p>
        </header>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Itens Cadastrados</h2>
          <div className={styles.inventoryList}>
            <div className={`${styles.itemCard} ${styles.activeItem}`}>
              <div className={styles.itemInfo}>
                <h3>Coxinha de Frango</h3>
                <span className={styles.price}>R$ 6,00</span>
              </div>
              <label className={styles.switch}>
                <input type="checkbox" defaultChecked />
                <span className={styles.slider}></span>
              </label>
            </div>

            <div className={`${styles.itemCard} ${styles.inactiveItem}`}>
              <div className={styles.itemInfo}>
                <h3>Sanduíche Natural</h3>
                <span className={styles.price}>R$ 8,50</span>
              </div>
              <label className={styles.switch}>
                <input type="checkbox" />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Cadastrar Novo Produto</h2>
          <div className={styles.formCard}>
            <div className={styles.inputGroup}>
              <label>Nome do Alimento</label>
              <input type="text" placeholder="Ex: Pastel de Carne" />
            </div>
            
            <div className={styles.inputGroup}>
              <label>Descrição</label>
              <input type="text" placeholder="Ex: Massa crocante e sequinha" />
            </div>

            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label>Preço</label>
                <input type="number" placeholder="0,00" />
              </div>
              <button className={styles.btnSave}>Salvar Produto</button>
            </div>
          </div>
        </section>

      </div>

    </div>
  );
}