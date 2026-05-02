import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import Navegacao from '../components/Navegacao';
import styles from './VendedorPage.module.css';

export default function VendedorPage() {
  const [produtos, setProdutos] = useState([]);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [mensagem, setMensagem] = useState('');

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  function sair() {
    localStorage.clear();
    navigate('/');
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    try {
      const data = await api.getProdutosPorCantina(user.id);
      setProdutos(data || []);
    } catch {
      setProdutos([]);
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

  async function salvarProduto(e) {
    e.preventDefault();
    setMensagem('');
    try {
      await api.criarProduto({ nome, descricao, preco: parseFloat(preco), cantina_id: user.id });
      setNome('');
      setDescricao('');
      setPreco('');
      setMensagem('Produto salvo com sucesso!');
      carregarProdutos();
    } catch (err) {
      setMensagem(err.message);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>

        <header className={styles.header}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ margin: 0 }}>Gestão do Dia</h1>
            <button onClick={sair} style={{ background: 'none', border: '1px solid #f97316', color: '#f97316', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontWeight: 600 }}>
              Sair
            </button>
          </div>
          <p>Ative os itens disponíveis ou cadastre novos</p>
        </header>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Itens Cadastrados</h2>
          <div className={styles.inventoryList}>
            {produtos.length === 0 && <p style={{ color: '#64748b' }}>Nenhum produto cadastrado.</p>}
            {produtos.map((p) => (
              <div key={p.id} className={`${styles.itemCard} ${p.disponivel ? styles.activeItem : styles.inactiveItem}`}>
                <div className={styles.itemInfo}>
                  <h3>{p.nome}</h3>
                  <span className={styles.price}>
                    R$ {parseFloat(p.preco).toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={!!p.disponivel}
                    onChange={() => toggleDisponivel(p)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Cadastrar Novo Produto</h2>
          <form className={styles.formCard} onSubmit={salvarProduto}>
            <div className={styles.inputGroup}>
              <label>Nome do Alimento</label>
              <input type="text" placeholder="Ex: Pastel de Carne" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Descrição</label>
              <input type="text" placeholder="Ex: Massa crocante e sequinha" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
            </div>
            <div className={styles.row}>
              <div className={styles.inputGroup}>
                <label>Preço</label>
                <input type="number" placeholder="0.00" step="0.01" min="0" value={preco} onChange={(e) => setPreco(e.target.value)} required />
              </div>
              <button type="submit" className={styles.btnSave}>Salvar Produto</button>
            </div>
            {mensagem && (
              <p style={{ marginTop: 8, color: mensagem.includes('sucesso') ? '#16a34a' : '#dc2626', fontSize: '0.875rem' }}>
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
