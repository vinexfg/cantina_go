import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { ReservasProvider } from './context/ReservasContext';
import { NotificacoesProvider } from './context/NotificacoesContext';
import LoginPage from './pages/LoginPage';
import { MenuPage } from './pages/MenuPage';
import PerfilPage from './pages/PerfilPage';
import MinhasReservasPage from './pages/MinhasReservasPage';
import VendedorPage from './pages/VendedorPage';
import { ReservasPage } from './pages/ReservasPage';
import { HistoricoPage } from './pages/HistoricoPage';
import NotFoundPage from './pages/NotFoundPage';

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
    <ThemeProvider>
      <ToastProvider>
      <ReservasProvider>
      <NotificacoesProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/menu" element={<RotaAluno><MenuPage /></RotaAluno>} />
          <Route path="/perfil" element={<RotaAluno><PerfilPage /></RotaAluno>} />
          <Route path="/meus-pedidos" element={<RotaAluno><MinhasReservasPage /></RotaAluno>} />
          <Route path="/vendedor" element={<RotaVendedor><VendedorPage /></RotaVendedor>} />
          <Route path="/reservas" element={<RotaVendedor><ReservasPage /></RotaVendedor>} />
          <Route path="/historico" element={<RotaVendedor><HistoricoPage /></RotaVendedor>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      </NotificacoesProvider>
      </ReservasProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
