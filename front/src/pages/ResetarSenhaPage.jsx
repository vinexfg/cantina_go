import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import styles from './LoginPage.module.css';

export default function ResetarSenhaPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (novaSenha.length < 8) { setErro('A senha deve ter pelo menos 8 caracteres'); return; }
    if (novaSenha !== confirmar) { setErro('As senhas não coincidem'); return; }
    setErro('');
    setCarregando(true);
    try {
      await api.resetarSenha(token, novaSenha);
      navigate('/?resetado=1');
    } catch (err) {
      setErro(err.message || 'Token inválido ou expirado. Solicite um novo link.');
    } finally {
      setCarregando(false);
    }
  }

  if (!token) {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginBox}>
          <main className={styles.card}>
            <p className={styles.erro}>⚠ Link inválido. <Link to="/esqueci-senha" className={styles.linkBtn}>Solicitar novo link</Link></p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <header className={styles.loginHeader}>
          <h1>Cantina<span>GO</span></h1>
          <p>Redefinição de senha</p>
        </header>

        <main className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Nova senha</h2>
            <p>Escolha uma senha com pelo menos 8 caracteres.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="novaSenha">Nova senha</label>
              <input
                id="novaSenha"
                type="password"
                placeholder="••••••••"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmar">Confirmar senha</label>
              <input
                id="confirmar"
                type="password"
                placeholder="••••••••"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                className={erro ? styles.inputErro : ''}
              />
              {erro && <span className={styles.erroMsg}>{erro}</span>}
            </div>

            <button type="submit" className={styles.btnSubmit} disabled={carregando}>
              {carregando ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}
