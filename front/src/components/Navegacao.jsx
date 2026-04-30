import styles from './Navegacao.module.css';

export default function Navegacao() {
  return (
    <nav className={styles.bottomNav}>
      <div className={`${styles.navItem} ${styles.active}`}>
        <span className={styles.navIcon}>🍴</span>
        <span className={styles.navText}>Menu</span>
      </div>
      
      <div className={styles.navItem}>
        <span className={styles.navIcon}>👤</span>
        <span className={styles.navText}>Perfil</span>
      </div>
    </nav>
  );
}