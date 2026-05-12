import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { api } from '../api';
import { useTheme } from '../context/ThemeContext';
import { STORAGE_KEYS } from '../constants/storage';
import { validarCampo as _validarCampo } from '../utils/validators';
import { IconSun, IconMoon } from '../components/ThemeIcons';
import styles from './LoginPage.module.css';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function CampoFormulario({ id, label, type = 'text', placeholder, value, onChange, onBlur, erro }) {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={erro ? styles.inputErro : ''}
      />
      {erro && <span className={styles.erroMsg}>{erro}</span>}
    </div>
  );
}

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
  const [codigo, setCodigo] = useState('');
  const [loadingVerif, setLoadingVerif] = useState(false);
  const [loadingReenviar, setLoadingReenviar] = useState(false);

  const [errosCampos, setErrosCampos] = useState({});

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
    setCarregandoCantinas(true);
    api.getCantinas()
      .then(data => setCantinas(data || []))
      .catch(() => setCantinas([]))
      .finally(() => setCarregandoCantinas(false));
  }, [isAluno]);

  function validarCampo(campo, valor) {
    return _validarCampo(campo, valor, { emailAtual: email });
  }

  function setCampoBorrado(campo, valor) {
    setErrosCampos(prev => ({ ...prev, [campo]: validarCampo(campo, valor) }));
  }

  function validarTudo() {
    const erros = {};
    if (modo === 'cadastro') {
      erros.nome = validarCampo('nome', nome);
      erros.confirmarEmail = validarCampo('confirmarEmail', confirmarEmail);
    }
    erros.email = validarCampo('email', email);
    erros.senha = validarCampo('senha', senha);
    if (isAluno && modo === 'login') {
      erros.cantinaId = validarCampo('cantinaId', cantinaId);
    }
    setErrosCampos(erros);
    return Object.values(erros).every(v => !v);
  }

  async function handleVerificarEmail(e) {
    e.preventDefault();
    if (!codigo || codigo.length !== 6) { setErro('Digite o código de 6 dígitos.'); return; }
    setErro('');
    setLoadingVerif(true);
    try {
      await api.verificarEmail(codigo);
      setSucesso('E-mail verificado! Agora você pode fazer login.');
      setModo('login');
      setCodigo('');
    } catch (err) {
      setErro(err.message || 'Código inválido ou expirado.');
    } finally {
      setLoadingVerif(false);
    }
  }

  async function handleReenviarCodigo() {
    setErro('');
    setLoadingReenviar(true);
    try {
      await api.reenviarVerificacao(email);
      setSucesso('Novo código enviado! Verifique sua caixa de entrada.');
    } catch {
      setErro('Não foi possível reenviar o código. Tente novamente.');
    } finally {
      setLoadingReenviar(false);
    }
  }

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
    setErrosCampos({});
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    if (!validarTudo()) return;

    setCarregando(true);
    try {
      if (modo === 'cadastro') {
        if (isAluno) {
          await api.registrarUsuario({ nome, email, senha });
          setSucesso('Conta criada! Digite o código enviado para ' + email);
          setModo('verificando');
          setCodigo('');
        } else {
          await api.registrarCantina({ nome, email, senha });
          setSucesso('Cantina cadastrada! Faça login para acessar o painel.');
          setModo('login');
        }
        setErro('');
        setSenha('');
        setNome('');
        setConfirmarEmail('');
        return;
      } else if (isAluno) {
        const data = await api.loginUsuario(email, senha);
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
        localStorage.setItem(STORAGE_KEYS.TIPO, 'usuario');
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.usuario));
        localStorage.setItem(STORAGE_KEYS.CANTINA_ID, cantinaId);
        localStorage.setItem(STORAGE_KEYS.CANTINA_NOME, cantinas.find(c => String(c.id) === String(cantinaId))?.nome || '');
        navigate('/menu');
      } else {
        const data = await api.loginCantina(email, senha);
        localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
        localStorage.setItem(STORAGE_KEYS.TIPO, 'cantina');
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.cantina));
        navigate('/vendedor');
      }
    } catch (err) {
      if (err.message && err.message.includes('não verificado')) {
        setModo('verificando');
        setSucesso('Insira o código enviado para ' + email);
        setErro('');
        setCodigo('');
      } else {
        setErro(err.message);
      }
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
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
      localStorage.setItem(STORAGE_KEYS.TIPO, 'usuario');
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.usuario));
      localStorage.setItem(STORAGE_KEYS.CANTINA_ID, cantinaId);
      localStorage.setItem(STORAGE_KEYS.CANTINA_NOME, cantinas.find(c => String(c.id) === String(cantinaId))?.nome || '');
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
              {modo === 'verificando' ? 'Verifique seu e-mail'
                : isAluno
                  ? modo === 'cadastro' ? 'Cadastro de Aluno' : 'Login de Aluno'
                  : modo === 'cadastro' ? 'Cadastro de Cantina' : 'Login da Cantina'}
            </h2>
            <p>
              {modo === 'verificando' ? 'Digite o código de 6 dígitos enviado para o seu e-mail'
                : isAluno
                  ? modo === 'cadastro'
                    ? 'Crie sua conta para fazer reservas'
                    : 'Entre para ver o menu e fazer reservas'
                  : modo === 'cadastro'
                    ? 'Cadastre sua cantina no sistema'
                    : 'Acesse o painel para gerenciar o menu'}
            </p>
          </div>

          {modo === 'verificando' && (
            <form onSubmit={handleVerificarEmail}>
              {sucesso && <p className={styles.sucesso}>✓ {sucesso}</p>}
              {erro && <p className={styles.erro}>⚠ {erro}</p>}
              <CampoFormulario
                id="codigo"
                label="Código de verificação"
                placeholder="000000"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onBlur={() => {}}
                erro={null}
              />
              <button type="submit" className={styles.btnSubmit} disabled={loadingVerif}>
                {loadingVerif ? 'Verificando...' : 'Verificar código'}
              </button>
              <div className={styles.alternar}>
                <p>
                  Não recebeu o código?{' '}
                  <button type="button" className={styles.linkBtn} onClick={handleReenviarCodigo} disabled={loadingReenviar}>
                    {loadingReenviar ? 'Enviando...' : 'Reenviar código'}
                  </button>
                </p>
              </div>
            </form>
          )}

          {modo !== 'verificando' && <form onSubmit={handleSubmit}>
            {modo === 'cadastro' && (
              <CampoFormulario
                id="nome" label="Nome completo" placeholder="Seu nome"
                value={nome} onChange={(e) => setNome(e.target.value)}
                onBlur={(e) => setCampoBorrado('nome', e.target.value)}
                erro={errosCampos.nome}
              />
            )}

            <CampoFormulario
              id="email" label="Email"
              placeholder={isAluno ? 'seu.email@escola.br' : 'vendedor@cantinago.br'}
              value={email} onChange={(e) => setEmail(e.target.value)}
              onBlur={(e) => setCampoBorrado('email', e.target.value)}
              erro={errosCampos.email}
            />

            {modo === 'cadastro' && (
              <CampoFormulario
                id="confirmarEmail" label="Confirmar e-mail" placeholder="Digite o e-mail novamente"
                value={confirmarEmail} onChange={(e) => setConfirmarEmail(e.target.value)}
                onBlur={(e) => setCampoBorrado('confirmarEmail', e.target.value)}
                erro={errosCampos.confirmarEmail}
              />
            )}

            <CampoFormulario
              id="senha" label="Senha" type="password" placeholder="••••••••"
              value={senha} onChange={(e) => setSenha(e.target.value)}
              onBlur={(e) => setCampoBorrado('senha', e.target.value)}
              erro={errosCampos.senha}
            />

            {isAluno && modo === 'login' && (
              <div className={styles.formGroup}>
                <label htmlFor="cantina">Cantina</label>
                <select
                  id="cantina"
                  value={cantinaId}
                  onChange={(e) => { setCantinaId(e.target.value); setCampoBorrado('cantinaId', e.target.value); }}
                  onBlur={(e) => setCampoBorrado('cantinaId', e.target.value)}
                  disabled={carregandoCantinas}
                  className={errosCampos.cantinaId ? styles.inputErro : ''}
                >
                  <option value="">
                    {carregandoCantinas ? 'Carregando...' : 'Selecione uma cantina'}
                  </option>
                  {cantinas.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
                {errosCampos.cantinaId && <span className={styles.erroMsg}>{errosCampos.cantinaId}</span>}
              </div>
            )}

            {sucesso && <p className={styles.sucesso}>✓ {sucesso}</p>}
            {erro && <p className={styles.erro}>⚠ {erro}</p>}

            {isAluno && modo === 'login' && (
              <div style={{ textAlign: 'right', marginBottom: '6px' }}>
                <Link to="/esqueci-senha" className={styles.linkBtn} style={{ fontSize: '0.82rem' }}>
                  Esqueci minha senha
                </Link>
              </div>
            )}

            <button type="submit" className={styles.btnSubmit} disabled={carregando}>
              {carregando
                ? modo === 'cadastro' ? 'Cadastrando...' : 'Entrando...'
                : modo === 'cadastro' ? 'Criar conta' : 'Entrar'}
            </button>
          </form>}

          {modo !== 'verificando' && (
            <div className={styles.alternar}>
              {modo === 'login' ? (
                <p>
                  {isAluno ? 'Não tem conta?' : 'Cantina não cadastrada?'}{' '}
                  <button className={styles.linkBtn} onClick={() => { setModo('cadastro'); setErro(''); }}>
                    Cadastre-se
                  </button>
                </p>
              ) : (
                <p>
                  Já tem {isAluno ? 'conta' : 'cadastro'}?{' '}
                  <button className={styles.linkBtn} onClick={() => { setModo('login'); setErro(''); }}>
                    Entrar
                  </button>
                </p>
              )}
            </div>
          )}

          {isAluno && googleClientId && modo !== 'verificando' && (
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
