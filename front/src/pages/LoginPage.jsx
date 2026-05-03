import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { api } from '../api';
import styles from './LoginPage.module.css';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
export default function LoginPage() {
  const [isAluno, setIsAluno] = useState(true);
  const [modo, setModo] = useState('login'); // 'login' | 'cadastro'
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const [cantinas, setCantinas] = useState([]);
  const [cantinaId, setCantinaId] = useState('');
  const [carregandoCantinas, setCarregandoCantinas] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAluno) return;
    setCarregandoCantinas(true);
    api.getCantinas()
      .then(data => setCantinas(data || []))
      .catch(() => setCantinas([]))
      .finally(() => setCarregandoCantinas(false));
  }, [isAluno]);

  function trocarAba(aluno) {
    setIsAluno(aluno);
    setModo('login');
    setErro('');
    setEmail('');
    setSenha('');
    setNome('');
    setConfirmarSenha('');
    setCantinaId('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    if (modo === 'cadastro' && senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    if (isAluno && !cantinaId) {
      setErro('Selecione um restaurante para continuar.');
      return;
    }

    setCarregando(true);
    try {
      if (modo === 'cadastro') {
        const data = await api.registrarUsuario({ nome, email, senha });
        localStorage.setItem('token', data.token);
        localStorage.setItem('tipo', 'usuario');
        localStorage.setItem('user', JSON.stringify(data.usuario));
        localStorage.setItem('cantina_id', cantinaId);
        navigate('/menu');
      } else if (isAluno) {
        const data = await api.loginUsuario(email, senha);
        localStorage.setItem('token', data.token);
        localStorage.setItem('tipo', 'usuario');
        localStorage.setItem('user', JSON.stringify(data.usuario));
        localStorage.setItem('cantina_id', cantinaId);
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
      setErro('Selecione um restaurante antes de entrar com Google.');
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
      navigate('/menu');
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>

        <header className={styles.loginHeader}>
          <h1>CantinaGO</h1>
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

            {modo === 'cadastro' && (
              <div className={styles.formGroup}>
                <label htmlFor="confirmarSenha">Confirmar senha</label>
                <input
                  id="confirmarSenha"
                  type="password"
                  placeholder="••••••••"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                />
              </div>
            )}

            {isAluno && (
              <div className={styles.formGroup}>
                <label htmlFor="cantina">Restaurante</label>
                <select
                  id="cantina"
                  value={cantinaId}
                  onChange={(e) => setCantinaId(e.target.value)}
                  disabled={carregandoCantinas}
                  required
                >
                  <option value="">
                    {carregandoCantinas ? 'Carregando...' : 'Selecione um restaurante'}
                  </option>
                  {cantinas.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
            )}

            {erro && <p className={styles.erro}>{erro}</p>}

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
