import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { STORAGE_KEYS } from './constants/storage';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { ReservasProvider } from './context/ReservasContext';
import { NotificacoesProvider } from './context/NotificacoesContext';
import LoginPage from './pages/LoginPage';
import EsqueciSenhaPage from './pages/EsqueciSenhaPage';
import ResetarSenhaPage from './pages/ResetarSenhaPage';
import VerificarEmailPage from './pages/VerificarEmailPage';
import MenuPage from './pages/MenuPage';
import PerfilPage from './pages/PerfilPage';
import MinhasReservasPage from './pages/MinhasReservasPage';
import VendedorPage from './pages/VendedorPage';
import ReservasPage from './pages/ReservasPage';
import HistoricoPage from './pages/HistoricoPage';
import NotFoundPage from './pages/NotFoundPage';
import CardapioPage from './pages/CardapioPage';

function RotaProtegida({ children, tipoRequerido, fallback }) {
  const tipo = localStorage.getItem(STORAGE_KEYS.TIPO);
  if (!tipo) return <Navigate to="/" replace />;
  if (tipo !== tipoRequerido) return <Navigate to={fallback} replace />;
  return children;
}

function RotaAluno({ children }) {
  return <RotaProtegida tipoRequerido="usuario" fallback="/vendedor">{children}</RotaProtegida>;
}

function RotaVendedor({ children }) {
  return <RotaProtegida tipoRequerido="cantina" fallback="/menu">{children}</RotaProtegida>;
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ConfirmProvider>
          <BrowserRouter>
            <ReservasProvider>
              <NotificacoesProvider>
                <Routes>
                  <Route path="/" element={<LoginPage />} />
                  <Route path="/cardapio" element={<CardapioPage />} />
                  <Route path="/esqueci-senha" element={<EsqueciSenhaPage />} />
                  <Route path="/resetar-senha" element={<ResetarSenhaPage />} />
                  <Route path="/verificar-email" element={<VerificarEmailPage />} />
                  <Route path="/menu" element={<RotaAluno><MenuPage /></RotaAluno>} />
                  <Route path="/perfil" element={<RotaAluno><PerfilPage /></RotaAluno>} />
                  <Route path="/meus-pedidos" element={<RotaAluno><MinhasReservasPage /></RotaAluno>} />
                  <Route path="/vendedor" element={<RotaVendedor><VendedorPage /></RotaVendedor>} />
                  <Route path="/reservas" element={<RotaVendedor><ReservasPage /></RotaVendedor>} />
                  <Route path="/historico" element={<RotaVendedor><HistoricoPage /></RotaVendedor>} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </NotificacoesProvider>
            </ReservasProvider>
          </BrowserRouter>
        </ConfirmProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
