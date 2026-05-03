import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navegacao from '../components/Navegacao.jsx';
import { api } from '../api.js';
import styles from './PerfilPage.module.css';

export default function PerfilPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const cantinaId = localStorage.getItem('cantina_id');
  const [cantinaNome, setCantinaNome] = useState(localStorage.getItem('cantina_nome') || '');

  useEffect(() => {
    if (!cantinaId || cantinaNome) return;
    api.getCantinas()
      .then(lista => {
        const found = lista.find(c => String(c.id) === String(cantinaId));
        if (found) {
          setCantinaNome(found.nome);
          localStorage.setItem('cantina_nome', found.nome);
        }
      })
      .catch(() => {});
  }, [cantinaId, cantinaNome]);

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
          <div className={styles.avatar}>
            {(user.nome || 'U').charAt(0).toUpperCase()}
          </div>
          <h2>{user.nome || 'Usuário'}</h2>
          <p>{user.email || ''}</p>
          {cantinaNome && (
            <div className={styles.cantinaBadge}>{cantinaNome}</div>
          )}
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
