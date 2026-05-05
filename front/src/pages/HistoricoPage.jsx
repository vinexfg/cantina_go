import { useState, useEffect } from 'react';
import { api } from '../api';
import Navegacao from '../components/Navegacao';
import styles from './HistoricoPage.module.css';

const POR_PAGINA = 10;

export function HistoricoPage() {
  const [reservas, setReservas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) return;

    api.limparReservasAntigas().catch(() => {});

    api.getHistorico(user.id)
      .then((data) => setReservas(data || []))
      .catch(() => setReservas([]))
      .finally(() => setCarregando(false));
  }, []);

  const filtradas = reservas.filter((r) =>
    (r.usuario_nome || '').toLowerCase().includes(busca.toLowerCase())
  );

  const totalPaginas = Math.ceil(filtradas.length / POR_PAGINA);
  const paginadas = filtradas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const total = reservas.reduce((acc, r) => acc + parseFloat(r.total || 0), 0);

  function handleBusca(e) {
    setBusca(e.target.value);
    setPagina(1);
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>

        <header className={styles.header}>
          <h1>Histórico da Semana</h1>
          <p>Pedidos entregues nos últimos 7 dias</p>
        </header>

        <section className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{reservas.length}</span>
            <span className={styles.statLabel}>Entregues</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>R$ {total.toFixed(2).replace('.', ',')}</span>
            <span className={styles.statLabel}>Total da Semana</span>
          </div>
        </section>

        <div className={styles.buscaWrapper}>
          <input
            className={styles.buscaInput}
            type="text"
            placeholder="Buscar por nome do aluno..."
            value={busca}
            onChange={handleBusca}
          />
        </div>

        <section className={styles.reservationsList}>
          {carregando && <p>Carregando...</p>}
          {!carregando && filtradas.length === 0 && (
            <p className={styles.vazio}>
              {busca ? 'Nenhum pedido encontrado para esse nome.' : 'Nenhum pedido entregue esta semana.'}
            </p>
          )}
          {paginadas.map((r) => (
            <div key={r.id} className={styles.reservationCard}>
              <div className={styles.resHeader}>
                <span className={styles.userName}>{r.usuario_nome || `#${r.id}`}</span>
                <span className={styles.badge}>Entregue</span>
              </div>
              <div className={styles.resTime}>
                {r.criado_em
                  ? new Date(r.criado_em).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: '2-digit',
                    }) + ' às ' + new Date(r.criado_em).toLocaleTimeString('pt-BR', {
                      hour: '2-digit', minute: '2-digit',
                    })
                  : ''}
              </div>
              <div className={styles.resContent}>
                {(r.itens || []).map((item, i) => (
                  <p key={i}>{item.quantidade}x <strong>{item.produto_nome || item.nome}</strong></p>
                ))}
              </div>
              <div className={styles.resFooter}>
                <span className={styles.resTotal}>
                  Total: R$ {parseFloat(r.total || 0).toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          ))}
        </section>

        {totalPaginas > 1 && (
          <div className={styles.paginacao}>
            <button
              className={styles.paginaBtn}
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina === 1}
            >
              ‹
            </button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className={`${styles.paginaBtn} ${n === pagina ? styles.paginaAtiva : ''}`}
                onClick={() => setPagina(n)}
              >
                {n}
              </button>
            ))}
            <button
              className={styles.paginaBtn}
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas}
            >
              ›
            </button>
          </div>
        )}

      </div>
      <Navegacao />
    </div>
  );
}
