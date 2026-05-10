import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import styles from './LoginPage.module.css';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) { setErro('Informe seu e-mail'); return; }
    setErro('');
    setCarregando(true);
    try {
      await api.solicitarResetSenha(email);
      setSucesso('Se o e-mail estiver cadastrado, você receberá as instruções em breve.');
    } catch {
      setErro('Não foi possível processar a solicitação. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <header className={styles.loginHeader}>
          <h1>Cantina<span>GO</span></h1>
          <p>Recuperação de senha</p>
        </header>

        <main className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Esqueci minha senha</h2>
            <p>Informe seu e-mail e enviaremos um link para redefinir a senha.</p>
          </div>

          {sucesso ? (
            <p className={styles.sucesso}>✓ {sucesso}</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="email">E-mail</label>
                <input
                  id="email"
                  type="email"
                  placeholder="seu.email@escola.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={erro ? styles.inputErro : ''}
                />
                {erro && <span className={styles.erroMsg}>{erro}</span>}
              </div>

              <button type="submit" className={styles.btnSubmit} disabled={carregando}>
                {carregando ? 'Enviando...' : 'Enviar link'}
              </button>
            </form>
          )}

          <div className={styles.alternar} style={{ marginTop: '18px' }}>
            <p><Link to="/" className={styles.linkBtn}>Voltar ao login</Link></p>
          </div>
        </main>
      </div>
    </div>
  );
}
