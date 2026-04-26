import { useState } from "react";
import styles from "./MainMenu.module.css";
import Produto from "../components/Produto";

function MainMenu() {
  return (
    <main className={styles.main}>
      <div className={styles.aviso}>
        <h2 className={styles.sub_sub_titulo}>Horário de atendimento</h2>
        <p>Segunda a Sexta: 08:00 - 20:00</p>
      </div>

      <section className={styles.cardapio}>
        <h2 className={styles.sub_titulo}>Cardápio de Hoje</h2>
        <Produto />
        <Produto />
        <Produto />
        <Produto />
      </section>
    </main>
  );
}

export default MainMenu;
