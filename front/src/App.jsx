import Navegacao from "./components/Navegacao";
import LoginPage from "./pages/LoginPage";
import { MenuPage } from "./pages/MenuPage";
import PerfilPage from "./pages/PerfilPage";
import { ReservasPage } from "./pages/ReservasPage";
import VendedorPage from "./pages/VendedorPage";

function App() {
  return (
    <>
      <LoginPage />
      <MenuPage />
      <PerfilPage />
      <VendedorPage />
      <ReservasPage />
      <PerfilPage />

      <Navegacao />

    </>
  );
}

export default App;
