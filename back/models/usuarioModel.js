import pool from "../db.js";
import crypto from "crypto";

const UsuarioModel = {
  async obterTodos() {
    const { rows } = await pool.query("SELECT * FROM usuarios");
    return rows;
  },

  async obterPorId(id) {
    const { rows } = await pool.query(
      "SELECT * FROM usuarios WHERE id = $1",
      [id]
    );
    return rows[0];
  },

  async obterPorEmail(email) {
    const { rows } = await pool.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );
    return rows[0];
  },

  async criar({ nome, email, senha }) {
    const id = crypto.randomUUID();

    await pool.query(
      "INSERT INTO usuarios (id, nome, email, senha) VALUES ($1, $2, $3, $4)",
      [id, nome, email, senha]
    );

    return { id, nome, email };
  },

  async atualizar(id, { nome, email, senha }) {
    const resultado = await pool.query(
      "UPDATE usuarios SET nome = $1, email = $2, senha = $3 WHERE id = $4",
      [nome, email, senha, id]
    );

    return resultado.rowCount > 0;
  },

  async remover(id) {
    const resultado = await pool.query(
      "DELETE FROM usuarios WHERE id = $1",
      [id]
    );

    return resultado.rowCount > 0;
  }
};

export default UsuarioModel;