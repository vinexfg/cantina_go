import { useState } from "react";
import styles from "./PageLogin.module.css";

function PageLogin() {
  return (
    <main className={styles.main}>
      <h1 className={styles.titulo_logo}>CantinaGO</h1>
      <p className={styles.sub_titulo_logo}>
        Reserve seu lanche com antecedência
      </p>
      <section className={styles.caixa_formulario}>
        <form action="" className={styles.formulario}>
          <h3>Login</h3>
          <label>Email</label>
          <input type="text" id="email" placeholder="exemplo@email.com" />
          <label>Senha</label>
          <input type="text" id="senha" placeholder="xxxxxxx" />

          <button className={styles.botao_formulario}>Entrar</button>
        </form>
      </section>
    </main>
  );
}

export default PageLogin;
