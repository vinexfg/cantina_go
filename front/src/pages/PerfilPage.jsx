
import styles from './PerfilPage.module.css';
import Navegacao from '../components/Navegacao.jsx'

export default function PerfilPage() {
  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        
        <header className={styles.header}>
          <h1>Meu Perfil</h1>
        </header>

        <section className={styles.userInfo}>
          <div className={styles.avatar}>👤</div>
          <h2>Nome do Usuário</h2>
          <p>usuario@email.com</p>
        </section>

        <section className={styles.optionsList}>
          <button className={`${styles.optionButton} ${styles.logout}`}>
            <span>Sair da Conta</span>
          </button>
        </section>

      </div>

    <Navegacao />
    </div>
  );
}