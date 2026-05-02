import { useLocation, useNavigate } from 'react-router-dom';
import styles from './Navegacao.module.css';

export default function Navegacao() {
  const location = useLocation();
  const navigate = useNavigate();
  const tipo = localStorage.getItem('tipo');

  const itens = tipo === 'cantina'
    ? [
        { path: '/vendedor', icon: '🍽️', label: 'Gestão' },
        { path: '/reservas', icon: '📋', label: 'Reservas' },
        { path: '/historico', icon: '📦', label: 'Histórico' },
      ]
    : [
        { path: '/menu', icon: '🍴', label: 'Menu' },
        { path: '/meus-pedidos', icon: '📋', label: 'Pedidos' },
        { path: '/perfil', icon: '👤', label: 'Perfil' },
      ];

  return (
    <nav className={styles.bottomNav}>
      {itens.map((item) => (
        <div
          key={item.path}
          className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''}`}
          onClick={() => navigate(item.path)}
          style={{ cursor: 'pointer' }}
        >
          <span className={styles.navIcon}>{item.icon}</span>
          <span className={styles.navText}>{item.label}</span>
        </div>
      ))}
    </nav>
  );
}
