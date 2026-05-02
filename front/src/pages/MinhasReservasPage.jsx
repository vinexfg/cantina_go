import { useState, useEffect } from 'react';
import { api } from '../api';
import Navegacao from '../components/Navegacao';
import styles from './MinhasReservasPage.module.css';

const STATUS_LABEL = {
  pendente:   { label: 'Pendente',   cor: styles.statusPendente },
  confirmada: { label: 'Confirmada', cor: styles.statusConfirmada },
  concluida:  { label: 'Concluída',  cor: styles.statusConcluida },
  cancelada:  { label: 'Cancelada',  cor: styles.statusCancelada },
};

export default function MinhasReservasPage() {
  const [reservas, setReservas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    api.getReservasPorUsuario(user.id)
      .then((data) => setReservas(data || []))
      .catch(() => setReservas([]))
      .finally(() => setCarregando(false));
  }, []);

  async function cancelar(id) {
    if (!confirm('Cancelar esta reserva?')) return;
    try {
      await api.removerReserva(id);
      setReservas((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>

        <header className={styles.header}>
          <h1>Meus Pedidos</h1>
          <p>Acompanhe suas reservas</p>
        </header>

        {carregando && <p className={styles.info}>Carregando...</p>}
        {!carregando && reservas.length === 0 && (
          <div className={styles.vazio}>
            <span>🍽️</span>
            <p>Você ainda não fez nenhuma reserva.</p>
          </div>
        )}

        <div className={styles.lista}>
          {reservas.map((r) => {
            const info = STATUS_LABEL[r.status] || STATUS_LABEL.pendente;
            return (
              <div key={r.id} className={styles.card}>

                <div className={styles.cardHeader}>
                  <span className={`${styles.status} ${info.cor}`}>{info.label}</span>
                  <span className={styles.data}>
                    {r.criado_em
                      ? new Date(r.criado_em).toLocaleDateString('pt-BR', {
                          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                        })
                      : ''}
                  </span>
                </div>

                <div className={styles.itensList}>
                  {(r.itens || []).map((item, i) => (
                    <div key={i} className={styles.itemRow}>
                      <span>{item.quantidade}x {item.produto_nome}</span>
                      <span className={styles.itemPreco}>
                        R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.total}>
                    Total: <strong>R$ {parseFloat(r.total || 0).toFixed(2).replace('.', ',')}</strong>
                  </span>
                  {r.status === 'pendente' && (
                    <button className={styles.btnCancelar} onClick={() => cancelar(r.id)}>
                      Cancelar
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>
      <Navegacao />
    </div>
  );
}
