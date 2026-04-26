import { useState } from "react";
import styles from "./NavBar.module.css";

function NavBar() {
  return (
    <nav className={styles.nav}>
      <h1 className={styles.titulo}>CantinaGO</h1>
      <p>Menu do dia</p>
    </nav>
  );
}

export default NavBar;
