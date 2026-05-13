import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useTheme } from '../context/ThemeContext';
import { formatPrice } from '../utils/formatPrice';
import { IconSun, IconMoon } from '../components/ThemeIcons';
import styles from './MenuPage.module.css';

export default function CardapioPage() {
  const [cantinas, setCantinas] = useState([]);
  const [cantinaId, setCantinaId] = useState('');
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    api.getCantinas()
      .then(data => {
        setCantinas(data || []);
        if (data?.length === 1) setCantinaId(String(data[0].id));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!cantinaId) { setProdutos([]); return; }
    setCarregando(true);
    api.getProdutosDisponiveis({ cantina_id: cantinaId })
      .then(({ data }) => setProdutos((data || []).filter(p => p.disponivel)))
      .catch(() => setProdutos([]))
      .finally(() => setCarregando(false));
  }, [cantinaId]);

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Cantina<span style={{ color: '#f97316' }}>GO</span> — Cardápio</h1>
        <button onClick={toggle} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>
          {theme === 'light' ? <IconMoon /> : <IconSun />}
        </button>
      </div>

      <select
        value={cantinaId}
        onChange={e => setCantinaId(e.target.value)}
        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 24, fontSize: '1rem' }}
      >
        <option value="">Selecione uma cantina</option>
        {cantinas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
      </select>

      {carregando && <p style={{ textAlign: 'center', color: '#64748b' }}>Carregando...</p>}

      {!carregando && cantinaId && produtos.length === 0 && (
        <p style={{ textAlign: 'center', color: '#64748b' }}>Nenhum produto disponível no momento.</p>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {produtos.map(p => (
          <div key={p.id} style={{ padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 600, margin: 0 }}>{p.nome}</p>
              {p.descricao && <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '4px 0 0' }}>{p.descricao}</p>}
            </div>
            <span style={{ fontWeight: 700, color: '#f97316', whiteSpace: 'nowrap', marginLeft: 12 }}>{formatPrice(p.preco)}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <Link to="/" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>
          Fazer login para reservar →
        </Link>
      </div>
    </div>
  );
}
