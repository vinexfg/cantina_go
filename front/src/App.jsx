import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import { MenuPage } from './pages/MenuPage';
import PerfilPage from './pages/PerfilPage';
import MinhasReservasPage from './pages/MinhasReservasPage';
import VendedorPage from './pages/VendedorPage';
import { ReservasPage } from './pages/ReservasPage';

function RotaAluno({ children }) {
  const tipo = localStorage.getItem('tipo');
  if (!tipo) return <Navigate to="/" replace />;
  if (tipo !== 'usuario') return <Navigate to="/vendedor" replace />;
  return children;
}

function RotaVendedor({ children }) {
  const tipo = localStorage.getItem('tipo');
  if (!tipo) return <Navigate to="/" replace />;
  if (tipo !== 'cantina') return <Navigate to="/menu" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/menu" element={<RotaAluno><MenuPage /></RotaAluno>} />
        <Route path="/perfil" element={<RotaAluno><PerfilPage /></RotaAluno>} />
        <Route path="/meus-pedidos" element={<RotaAluno><MinhasReservasPage /></RotaAluno>} />
        <Route path="/vendedor" element={<RotaVendedor><VendedorPage /></RotaVendedor>} />
        <Route path="/reservas" element={<RotaVendedor><ReservasPage /></RotaVendedor>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
