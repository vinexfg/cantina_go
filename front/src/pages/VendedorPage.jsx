import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import Navegacao from '../components/Navegacao';
import { useConfirm } from '../context/ConfirmContext';
import { STORAGE_KEYS } from '../constants/storage';
import styles from './VendedorPage.module.css';

export default function VendedorPage() {
  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [editando, setEditando] = useState(null);
  const [errosForm, setErrosForm] = useState({});
  const [horarioAbertura, setHorarioAbertura] = useState('');
  const [horarioFechamento, setHorarioFechamento] = useState('');
  const [salvandoHorario, setSalvandoHorario] = useState(false);
  const [msgHorario, setMsgHorario] = useState('');

  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || '{}');
  const userId = user.id;

  function sair() {
    localStorage.clear();
    navigate('/');
  }

  async function carregarProdutos() {
    try {
      const { data } = await api.getProdutosPorCantina(userId);
      setProdutos(data || []);
    } catch {
      setProdutos([]);
    }
  }

  useEffect(() => {
    let ativo = true;
    api.getProdutosPorCantina(userId)
      .then(({ data }) => { if (ativo) setProdutos(data || []); })
      .catch(() => { if (ativo) setProdutos([]); });

    api.getCantinaPorId(userId)
      .then(data => {
        if (!ativo) return;
        setHorarioAbertura(data?.horario_abertura || '');
        setHorarioFechamento(data?.horario_fechamento || '');
      })
      .catch(() => {});

    return () => { ativo = false; };
  }, [userId]);

  async function salvarHorario(e) {
    e.preventDefault();
    setSalvandoHorario(true);
    setMsgHorario('');
    try {
      await api.atualizarHorario(userId, {
        horario_abertura: horarioAbertura || null,
        horario_fechamento: horarioFechamento || null,
      });
      setMsgHorario('Horário salvo com sucesso!');
    } catch (err) {
      setMsgHorario(err.message);
    } finally {
      setSalvandoHorario(false);
    }
  }

  async function toggleDisponivel(produto) {
    try {
      await api.atualizarProduto(produto.id, {
        nome: produto.nome,
        descricao: produto.descricao,
        preco: produto.preco,
        cantina_id: produto.cantina_id,
        disponivel: !produto.disponivel,
      });
      setProdutos((prev) =>
        prev.map((p) => p.id === produto.id ? { ...p, disponivel: !p.disponivel } : p)
      );
    } catch (err) {
      setMensagem(err.message);
    }
  }

  function iniciarEdicao(produto) {
    setEditando(produto);
    setNome(produto.nome);
    setDescricao(produto.descricao || '');
    setPreco(String(produto.preco));
    setMensagem('');
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  function cancelarEdicao() {
    setEditando(null);
    setNome('');
    setDescricao('');
    setPreco('');
    setMensagem('');
    setErrosForm({});
  }

  function validarFormProduto() {
    const erros = {};
    if (!nome.trim()) erros.nome = 'Nome é obrigatório';
    const precoNum = parseFloat(preco);
    if (!preco) erros.preco = 'Preço é obrigatório';
    else if (isNaN(precoNum) || precoNum < 0) erros.preco = 'Preço deve ser um número positivo';
    setErrosForm(erros);
    return Object.keys(erros).length === 0;
  }

  async function excluirProduto(id) {
    if (!await confirm('Excluir este produto?')) return;
    try {
      await api.removerProduto(id);
      setProdutos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setMensagem(err.message);
    }
  }

  async function salvarProduto(e) {
    e.preventDefault();
    setMensagem('');
    if (!validarFormProduto()) return;
    try {
      if (editando) {
        await api.atualizarProduto(editando.id, {
          nome,
          descricao,
          preco: parseFloat(preco),
          cantina_id: userId,
          disponivel: editando.disponivel,
        });
        setMensagem('Produto atualizado com sucesso!');
        cancelarEdicao();
      } else {
        await api.criarProduto({ nome, descricao, preco: parseFloat(preco), cantina_id: userId });
        setNome('');
        setDescricao('');
        setPreco('');
        setMensagem('Produto salvo com sucesso!');
      }
      carregarProdutos();
    } catch (err) {
      setMensagem(err.message);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>

        <header className={styles.header}>
          <div className={styles.headerRow}>
            <h1>Gestão do Dia</h1>
            <button onClick={sair} className={styles.btnSair}>
              Sair
            </button>
          </div>
          <p>Ative os itens disponíveis ou cadastre novos</p>
        </header>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Itens Cadastrados</h2>
          <div className={styles.inventoryList}>
            {produtos.length === 0 && <p className={styles.listaVazia}>Nenhum produto cadastrado.</p>}
            {produtos.map((p) => (
              <div key={p.id} className={`${styles.itemCard} ${p.disponivel ? styles.activeItem : styles.inactiveItem}`}>
                <div className={styles.itemInfo}>
                  <h3>{p.nome}</h3>
                  <div className={styles.itemMeta}>
                    <span className={styles.price}>R$ {parseFloat(p.preco).toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
                <div className={styles.itemActions}>
                  <button className={styles.btnEdit} onClick={() => iniciarEdicao(p)} title="Editar">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button className={styles.btnDelete} onClick={() => excluirProduto(p.id)} title="Excluir">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                    </svg>
                  </button>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={!!p.disponivel}
                      onChange={() => toggleDisponivel(p)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Horário de Funcionamento</h2>
          <form className={styles.formCard} onSubmit={salvarHorario}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div className={styles.inputGroup} style={{ flex: 1, minWidth: '120px' }}>
                <label>Abertura</label>
                <input
                  type="time"
                  value={horarioAbertura}
                  onChange={(e) => setHorarioAbertura(e.target.value)}
                />
              </div>
              <div className={styles.inputGroup} style={{ flex: 1, minWidth: '120px' }}>
                <label>Fechamento</label>
                <input
                  type="time"
                  value={horarioFechamento}
                  onChange={(e) => setHorarioFechamento(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className={styles.btnSave} disabled={salvandoHorario}>
              {salvandoHorario ? 'Salvando...' : 'Salvar Horário'}
            </button>
            {msgHorario && (
              <p className={msgHorario.includes('sucesso') ? styles.mensagemSucesso : styles.mensagemErro}>
                {msgHorario}
              </p>
            )}
          </form>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{editando ? 'Editar Produto' : 'Cadastrar Novo Produto'}</h2>
          <form className={`${styles.formCard} ${editando ? styles.formEditando : ''}`} onSubmit={salvarProduto}>
            <div className={styles.inputGroup}>
              <label>Nome do Alimento</label>
              <input
                type="text"
                placeholder="Ex: Pastel de Carne"
                value={nome}
                onChange={(e) => { setNome(e.target.value); if (errosForm.nome) setErrosForm(p => ({ ...p, nome: '' })); }}
                className={errosForm.nome ? styles.inputErro : ''}
              />
              {errosForm.nome && <span className={styles.erroMsg}>{errosForm.nome}</span>}
            </div>
            <div className={styles.inputGroup}>
              <label>Descrição</label>
              <input type="text" placeholder="Ex: Massa crocante e sequinha" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
            </div>
            <div className={styles.inputGroup}>
              <label>Preço</label>
              <input
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={preco}
                onChange={(e) => { setPreco(e.target.value); if (errosForm.preco) setErrosForm(p => ({ ...p, preco: '' })); }}
                className={errosForm.preco ? styles.inputErro : ''}
              />
              {errosForm.preco && <span className={styles.erroMsg}>{errosForm.preco}</span>}
            </div>
            <button type="submit" className={styles.btnSave}>{editando ? 'Atualizar' : 'Salvar Produto'}</button>
            {editando && (
              <button type="button" className={styles.btnCancelarEdicao} onClick={cancelarEdicao}>
                Cancelar edição
              </button>
            )}
            {mensagem && (
              <p className={mensagem.includes('sucesso') ? styles.mensagemSucesso : styles.mensagemErro}>
                {mensagem}
              </p>
            )}
          </form>
        </section>

      </div>
      <Navegacao />
    </div>
  );
}
