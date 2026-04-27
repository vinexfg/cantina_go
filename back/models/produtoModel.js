import pool from "../db.js";
import crypto from "crypto";

const ProdutoModel = {
  async obterTodos() {
    const { rows } = await pool.query("SELECT * FROM produtos");
    return rows;
  },

  async obterPorId(id) {
    const { rows } = await pool.query(
      "SELECT * FROM produtos WHERE id = $1",
      [id]
    );
    return rows[0];
  },

  async obterDisponiveis() {
    const { rows } = await pool.query(
      "SELECT * FROM produtos WHERE status = 'disponivel'"
    );
    return rows;
  },

  async criar({ nome, descricao, preco, status }) {
    const id = crypto.randomUUID();

    await pool.query(
      "INSERT INTO produtos (id, nome, descricao, preco, status) VALUES ($1, $2, $3, $4, $5)",
      [id, nome, descricao, preco, status]
    );

    return { id, nome, descricao, preco, status };
  },

  async atualizar(id, { nome, descricao, preco, status }) {
    const resultado = await pool.query(
      "UPDATE produtos SET nome = $1, descricao = $2, preco = $3, status = $4 WHERE id = $5",
      [nome, descricao, preco, status, id]
    );

    return resultado.rowCount > 0; 
  },

  async remover(id) {
    const resultado = await pool.query(
      "DELETE FROM produtos WHERE id = $1",
      [id]
    );

    return resultado.rowCount > 0; 
  }
};

export default ProdutoModel;