import { useState } from "react";
import styles from "./MainPerfil.module.css";

function MainPerfil() {
  return (
    <main className={styles.main}>
      <section className={styles.perfil}>
        <h2 className={styles.sub_titulo}>Meu Perfil</h2>
        <div>Rodrigo Silva Duarte da Costa</div>
      </section>
    </main>
  );
}

export default MainPerfil;
