import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navegacao from '../components/Navegacao.jsx';
import { api } from '../api.js';
import { STORAGE_KEYS } from '../constants/storage';
import styles from './PerfilPage.module.css';

export default function PerfilPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
  const cantinaId = localStorage.getItem(STORAGE_KEYS.CANTINA_ID);
  const [cantinaNome, setCantinaNome] = useState(localStorage.getItem(STORAGE_KEYS.CANTINA_NOME) || '');

  const [modalAberto, setModalAberto] = useState(false);
  const [senha, setSenha] = useState('');
  const [erroSenha, setErroSenha] = useState('');
  const [excluindo, setExcluindo] = useState(false);

  useEffect(() => {
    if (!cantinaId || cantinaNome) return;
    api.getCantinas()
      .then(lista => {
        const found = lista.find(c => String(c.id) === String(cantinaId));
        if (found) {
          setCantinaNome(found.nome);
          localStorage.setItem(STORAGE_KEYS.CANTINA_NOME, found.nome);
        }
      })
      .catch(() => {});
  }, [cantinaId, cantinaNome]);

  function sair() {
    localStorage.clear();
    navigate('/');
  }

  function abrirModal() {
    setSenha('');
    setErroSenha('');
    setModalAberto(true);
  }

  function fecharModal() {
    if (excluindo) return;
    setModalAberto(false);
    setSenha('');
    setErroSenha('');
  }

  async function confirmarExclusao() {
    if (!senha) {
      setErroSenha('Digite sua senha para confirmar.');
      return;
    }
    setExcluindo(true);
    setErroSenha('');
    try {
      await api.excluirConta(senha);
      localStorage.clear();
      navigate('/');
    } catch (err) {
      setErroSenha(err.message || 'Senha incorreta. Tente novamente.');
      setExcluindo(false);
    }
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

        <div className={styles.dangerZone}>
          <button className={styles.btnExcluirConta} onClick={abrirModal}>
            Excluir minha conta
          </button>
        </div>

      </div>

      {modalAberto && (
        <div className={styles.overlay} onClick={fecharModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalIcone}>⚠</div>
            <h3 className={styles.modalTitulo}>Excluir conta?</h3>
            <p className={styles.modalDesc}>
              Essa ação é permanente e não pode ser desfeita. Todos os seus dados e reservas serão apagados.
            </p>
            <p className={styles.modalDesc}>
              Digite sua senha para confirmar:
            </p>
            <input
              className={`${styles.modalInput} ${erroSenha ? styles.modalInputErro : ''}`}
              type="password"
              placeholder="Sua senha"
              value={senha}
              onChange={e => { setSenha(e.target.value); setErroSenha(''); }}
              onKeyDown={e => e.key === 'Enter' && confirmarExclusao()}
              autoFocus
            />
            {erroSenha && <p className={styles.erroMsg}>{erroSenha}</p>}
            <div className={styles.modalBotoes}>
              <button className={styles.btnCancelarModal} onClick={fecharModal} disabled={excluindo}>
                Cancelar
              </button>
              <button className={styles.btnConfirmarExcluir} onClick={confirmarExclusao} disabled={excluindo}>
                {excluindo ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Navegacao />
    </div>
  );
}
