import { useNavigate } from 'react-router-dom';
import Navegacao from '../components/Navegacao.jsx';
import styles from './PerfilPage.module.css';

export default function PerfilPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  function sair() {
    localStorage.clear();
    navigate('/');
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>

        <header className={styles.header}>
          <h1>Meu Perfil</h1>
        </header>

        <section className={styles.userInfo}>
          <div className={styles.avatar}>👤</div>
          <h2>{user.nome || 'Usuário'}</h2>
          <p>{user.email || ''}</p>
        </section>

        <section className={styles.optionsList}>
          <button className={`${styles.optionButton} ${styles.logout}`} onClick={sair}>
            <span>Sair da Conta</span>
          </button>
        </section>

      </div>
      <Navegacao />
    </div>
  );
}
