import { useState, useEffect } from 'react';
import { api } from '../api';
import Navegacao from '../components/Navegacao';
import styles from './MenuPage.module.css';

export function MenuPage() {
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);

  useEffect(() => {
    api.getProdutosDisponiveis()
      .then(setProdutos)
      .catch(() => setProdutos([]))
      .finally(() => setCarregando(false));
  }, []);

  function alterar(id, delta) {
    setCarrinho((prev) => {
      const qtd = Math.max(0, (prev[id] || 0) + delta);
      if (qtd === 0) {
        const { [id]: _, ...resto } = prev;
        return resto;
      }
      return { ...prev, [id]: qtd };
    });
  }

  function removerItem(id) {
    setCarrinho((prev) => {
      const { [id]: _, ...resto } = prev;
      return resto;
    });
  }

  const itensNoCarrinho = Object.keys(carrinho).length;
  const totalQtd = Object.values(carrinho).reduce((a, b) => a + b, 0);
  const total = produtos.reduce((acc, p) => acc + (carrinho[p.id] || 0) * parseFloat(p.preco), 0);
  const itensCarrinho = produtos.filter(p => carrinho[p.id] > 0);

  async function confirmar() {
    const itens = Object.entries(carrinho).map(([produto_id, quantidade]) => ({ produto_id, quantidade }));
    if (itens.length === 0) return;

    const user = JSON.parse(localStorage.getItem('user'));
    const primeiroProduto = produtos.find(p => p.id === itens[0].produto_id);
    const cantina_id = primeiroProduto?.cantina_id;

    setEnviando(true);
    setMensagem('');
    try {
      await api.criarReserva({ usuario_id: user.id, cantina_id, itens });
      setCarrinho({});
      setCarrinhoAberto(false);
      setMensagem('Reserva feita com sucesso!');
    } catch (err) {
      setMensagem(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>

        <header className={styles.header}>
          <h1>Cardápio do Dia</h1>
          <p>Selecione os itens para sua reserva</p>
        </header>

        {mensagem && (
          <p className={`${styles.mensagem} ${mensagem.includes('sucesso') ? styles.sucesso : styles.erro}`}>
            {mensagem}
          </p>
        )}

        <section className={styles.menuList}>
          {carregando && <p className={styles.info}>Carregando...</p>}
          {!carregando && produtos.length === 0 && (
            <p className={styles.info}>Nenhum item disponível no momento.</p>
          )}
          {produtos.map((p) => (
            <div key={p.id} className={`${styles.itemCard} ${carrinho[p.id] ? styles.itemSelecionado : ''}`}>
              <div className={styles.itemInfo}>
                <h3>{p.nome}</h3>
                {p.descricao && <p>{p.descricao}</p>}
                <span className={styles.price}>
                  R$ {parseFloat(p.preco).toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className={styles.qtdControl}>
                <button onClick={() => alterar(p.id, -1)} disabled={!carrinho[p.id]}>−</button>
                <span>{carrinho[p.id] || 0}</span>
                <button onClick={() => alterar(p.id, 1)}>+</button>
              </div>
            </div>
          ))}
        </section>

      </div>

      {/* Botão flutuante do carrinho */}
      {itensNoCarrinho > 0 && !carrinhoAberto && (
        <button className={styles.btnCarrinho} onClick={() => setCarrinhoAberto(true)}>
          <span className={styles.carriNhoBadge}>{totalQtd}</span>
          🛒 Ver carrinho
          <span className={styles.carrinhoTotal}>R$ {total.toFixed(2).replace('.', ',')}</span>
        </button>
      )}

      {/* Overlay */}
      {carrinhoAberto && (
        <div className={styles.overlay} onClick={() => setCarrinhoAberto(false)} />
      )}

      {/* Gaveta do carrinho */}
      <div className={`${styles.drawer} ${carrinhoAberto ? styles.drawerAberto : ''}`}>
        <div className={styles.drawerHeader}>
          <h2>Seu Carrinho</h2>
          <button className={styles.fecharBtn} onClick={() => setCarrinhoAberto(false)}>✕</button>
        </div>

        <div className={styles.drawerItens}>
          {itensCarrinho.map((p) => (
            <div key={p.id} className={styles.carrinhoItem}>
              <div className={styles.carrinhoItemInfo}>
                <span className={styles.carrinhoItemNome}>{p.nome}</span>
                <span className={styles.carrinhoItemPreco}>
                  R$ {(parseFloat(p.preco) * carrinho[p.id]).toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className={styles.carrinhoItemControle}>
                <div className={styles.qtdControl}>
                  <button onClick={() => alterar(p.id, -1)}>−</button>
                  <span>{carrinho[p.id]}</span>
                  <button onClick={() => alterar(p.id, 1)}>+</button>
                </div>
                <button className={styles.removerBtn} onClick={() => removerItem(p.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.drawerFooter}>
          <div className={styles.drawerTotal}>
            <span>Total</span>
            <span className={styles.drawerTotalValor}>R$ {total.toFixed(2).replace('.', ',')}</span>
          </div>
          {mensagem && (
            <p className={`${styles.mensagem} ${mensagem.includes('sucesso') ? styles.sucesso : styles.erro}`}>
              {mensagem}
            </p>
          )}
          <button
            className={styles.btnFinalize}
            onClick={confirmar}
            disabled={enviando}
          >
            {enviando ? 'Enviando...' : 'Confirmar Reserva'}
          </button>
        </div>
      </div>

      <Navegacao />
    </div>
  );
}
