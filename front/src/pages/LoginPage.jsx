import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { api } from '../api';
import { useTheme } from '../context/ThemeContext';
import styles from './LoginPage.module.css';

const IconSun = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const IconMoon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
);

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
export default function LoginPage() {
  const [isAluno, setIsAluno] = useState(true);
  const [modo, setModo] = useState('login'); // 'login' | 'cadastro'
  const [email, setEmail] = useState('');
  const [confirmarEmail, setConfirmarEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  const [cantinas, setCantinas] = useState([]);
  const [cantinaId, setCantinaId] = useState('');
  const [carregandoCantinas, setCarregandoCantinas] = useState(true);

  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  useEffect(() => {
    document.body.style.paddingBottom = '0';
    return () => { document.body.style.paddingBottom = ''; };
  }, []);

  useEffect(() => {
    if (!isAluno) return;
    api.getCantinas()
      .then(data => setCantinas(data || []))
      .catch(() => setCantinas([]))
      .finally(() => setCarregandoCantinas(false));
  }, [isAluno]);

  function trocarAba(aluno) {
    setIsAluno(aluno);
    setModo('login');
    setErro('');
    setSucesso('');
    setEmail('');
    setConfirmarEmail('');
    setSenha('');
    setNome('');
    setCantinaId('');
    setCarregandoCantinas(aluno);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    if (modo === 'cadastro' && email !== confirmarEmail) {
      setErro('Os e-mails não coincidem.');
      return;
    }

    if (modo === 'login' && isAluno && !cantinaId) {
      setErro('Selecione uma cantina para continuar.');
      return;
    }

    setCarregando(true);
    try {
      if (modo === 'cadastro') {
        await api.registrarUsuario({ nome, email, senha });
        setModo('login');
        setSucesso('Conta criada! Faça login e escolha sua cantina.');
        setErro('');
        setSenha('');
        setNome('');
        setConfirmarEmail('');
        return;
      } else if (isAluno) {
        const data = await api.loginUsuario(email, senha);
        localStorage.setItem('token', data.token);
        localStorage.setItem('tipo', 'usuario');
        localStorage.setItem('user', JSON.stringify(data.usuario));
        localStorage.setItem('cantina_id', cantinaId);
        localStorage.setItem('cantina_nome', cantinas.find(c => String(c.id) === String(cantinaId))?.nome || '');
        navigate('/menu');
      } else {
        const data = await api.loginCantina(email, senha);
        localStorage.setItem('token', data.token);
        localStorage.setItem('tipo', 'cantina');
        localStorage.setItem('user', JSON.stringify(data.cantina));
        navigate('/vendedor');
      }
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  async function handleGoogleSuccess(credentialResponse) {
    if (!cantinaId) {
      setErro('Selecione uma cantina antes de entrar com Google.');
      return;
    }
    setErro('');
    setCarregando(true);
    try {
      const data = await api.googleLogin(credentialResponse.credential);
      localStorage.setItem('token', data.token);
      localStorage.setItem('tipo', 'usuario');
      localStorage.setItem('user', JSON.stringify(data.usuario));
      localStorage.setItem('cantina_id', cantinaId);
      localStorage.setItem('cantina_nome', cantinas.find(c => String(c.id) === String(cantinaId))?.nome || '');
      navigate('/menu');
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className={styles.loginContainer}>
      <button className={styles.themeToggle} onClick={toggle} title="Alternar tema">
        {theme === 'light' ? <IconMoon /> : <IconSun />}
      </button>
      <div className={styles.loginBox}>

        <header className={styles.loginHeader}>
          <div className={styles.logoIcon}>
            <img src="/galinha2.png" alt="CantinaGO" className={styles.logoGalinha} />
          </div>
          <h1>Cantina<span>GO</span></h1>
          <p>Reserve seu lanche com antecedência</p>

        </header>

        <div className={styles.tabsList}>
          <button
            className={`${styles.tabTrigger} ${isAluno ? styles.activeTab : ''}`}
            onClick={() => trocarAba(true)}
          >
            Aluno
          </button>
          <button
            className={`${styles.tabTrigger} ${!isAluno ? styles.activeTab : ''}`}
            onClick={() => trocarAba(false)}
          >
            Cantina
          </button>
        </div>

        <main className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>
              {isAluno
                ? modo === 'cadastro' ? 'Cadastro de Aluno' : 'Login de Aluno'
                : 'Login da Cantina'}
            </h2>
            <p>
              {isAluno
                ? modo === 'cadastro'
                  ? 'Crie sua conta para fazer reservas'
                  : 'Entre para ver o menu e fazer reservas'
                : 'Acesse o painel para gerenciar o menu'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {modo === 'cadastro' && (
              <div className={styles.formGroup}>
                <label htmlFor="nome">Nome completo</label>
                <input
                  id="nome"
                  type="text"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder={isAluno ? 'seu.email@escola.br' : 'vendedor@cantinago.br'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {modo === 'cadastro' && (
              <div className={styles.formGroup}>
                <label htmlFor="confirmarEmail">Confirmar e-mail</label>
                <input
                  id="confirmarEmail"
                  type="email"
                  placeholder="Digite o e-mail novamente"
                  value={confirmarEmail}
                  onChange={(e) => setConfirmarEmail(e.target.value)}
                  required
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="senha">Senha</label>
              <input
                id="senha"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>


            {isAluno && modo === 'login' && (
              <div className={styles.formGroup}>
                <label htmlFor="cantina">Cantina</label>
                <select
                  id="cantina"
                  value={cantinaId}
                  onChange={(e) => setCantinaId(e.target.value)}
                  disabled={carregandoCantinas}
                  required
                >
                  <option value="">
                    {carregandoCantinas ? 'Carregando...' : 'Selecione uma cantina'}
                  </option>
                  {cantinas.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
            )}

            {sucesso && <p className={styles.sucesso}>✓ {sucesso}</p>}
            {erro && <p className={styles.erro}>⚠ {erro}</p>}

            <button type="submit" className={styles.btnSubmit} disabled={carregando}>
              {carregando
                ? modo === 'cadastro' ? 'Cadastrando...' : 'Entrando...'
                : modo === 'cadastro' ? 'Criar conta' : 'Entrar'}
            </button>
          </form>

          {isAluno && (
            <div className={styles.alternar}>
              {modo === 'login' ? (
                <p>
                  Não tem conta?{' '}
                  <button className={styles.linkBtn} onClick={() => { setModo('cadastro'); setErro(''); }}>
                    Cadastre-se
                  </button>
                </p>
              ) : (
                <p>
                  Já tem conta?{' '}
                  <button className={styles.linkBtn} onClick={() => { setModo('login'); setErro(''); }}>
                    Entrar
                  </button>
                </p>
              )}
            </div>
          )}

          {isAluno && googleClientId && (
            <div className={styles.googleSection}>
              <div className={styles.divisor}>
                <span>ou</span>
              </div>
              <div className={styles.googleWrapper}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setErro('Falha ao autenticar com Google.')}
                  text={modo === 'cadastro' ? 'signup_with' : 'signin_with'}
                  shape="rectangular"
                  width="100%"
                />
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
