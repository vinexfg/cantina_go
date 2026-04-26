import { useState } from "react";
import styles from "./NavBarInferior.module.css";

function NavBarInferior() {
  return (
    <nav className={styles.nav_inferior}>
      <a href="#" className={styles.opcoes}>
        Menu
      </a>
      <a href="#" className={styles.opcoes}>
        Reservas
      </a>
      <a href="#" className={styles.opcoes}>
        Perfil
      </a>
    </nav>
  );
}

export default NavBarInferior;
