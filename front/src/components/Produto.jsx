import { useState } from "react";
import styles from "./Produto.module.css";

function Produto() {
  return (
    <>
      <div className={styles.produto}>
        <h2 className={styles.titulo}>Creme de Galinha</h2>
        <p>Frango, arroz e batata palha</p>
        <h2 className={styles.titulo}>R$ 14.00</h2>
        <button className={styles.botao_reserva}>Reservar</button>
      </div>
    </>
  );
}

export default Produto;
