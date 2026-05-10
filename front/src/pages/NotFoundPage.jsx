import { useNavigate } from 'react-router-dom';
import { STORAGE_KEYS } from '../constants/storage';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const tipo = localStorage.getItem(STORAGE_KEYS.TIPO);
  const destino = tipo === 'cantina' ? '/vendedor' : tipo === 'usuario' ? '/menu' : '/';

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      padding: 24,
      textAlign: 'center',
      background: 'var(--bg, #f8fafc)',
      color: 'var(--text, #1e293b)',
    }}>
      <span style={{ fontSize: '4rem', lineHeight: 1 }}>404</span>
      <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Página não encontrada</h1>
      <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
        O endereço que você acessou não existe.
      </p>
      <button
        onClick={() => navigate(destino, { replace: true })}
        style={{
          marginTop: 8,
          padding: '10px 24px',
          borderRadius: 10,
          border: 'none',
          background: '#f97316',
          color: '#fff',
          fontWeight: 600,
          fontSize: '0.95rem',
          cursor: 'pointer',
        }}
      >
        Voltar ao início
      </button>
    </div>
  );
}
