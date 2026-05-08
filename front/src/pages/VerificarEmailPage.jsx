import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api';
import styles from './LoginPage.module.css';

export default function VerificarEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [estado, setEstado] = useState('carregando'); // 'carregando' | 'sucesso' | 'erro'
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    if (!token) { setEstado('erro'); setMensagem('Link inválido.'); return; }
    api.verificarEmail(token)
      .then(() => setEstado('sucesso'))
      .catch((err) => { setEstado('erro'); setMensagem(err.message || 'Token inválido ou expirado.'); });
  }, [token]);

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <header className={styles.loginHeader}>
          <h1>Cantina<span>GO</span></h1>
          <p>Verificação de e-mail</p>
        </header>

        <main className={styles.card}>
          {estado === 'carregando' && (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Verificando...</p>
          )}

          {estado === 'sucesso' && (
            <>
              <p className={styles.sucesso}>✓ E-mail verificado com sucesso!</p>
              <div className={styles.alternar}>
                <p><Link to="/" className={styles.linkBtn}>Ir para o login</Link></p>
              </div>
            </>
          )}

          {estado === 'erro' && (
            <>
              <p className={styles.erro}>⚠ {mensagem}</p>
              <div className={styles.alternar}>
                <p><Link to="/" className={styles.linkBtn}>Voltar ao login</Link></p>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
