import pool from '../db.js';

class ProdutoRepository {
  static async findAll() {
    const query = 'SELECT * FROM produtos';
    const { rows } = await pool.query(query);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM produtos WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  static async findDisponiveis() {
    const query = "SELECT * FROM produtos WHERE status = $1";
    const { rows } = await pool.query(query, ['disponivel']);
    return rows;
  }

  static async create(data) {
    const { id, nome, descricao, preco, status } = data;
    const query = 'INSERT INTO produtos (id, nome, descricao, preco, status) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const { rows } = await pool.query(query, [id, nome, descricao, preco, status]);
    return rows[0];
  }

  static async update(id, data) {
    const { nome, descricao, preco, status } = data;
    const query = 'UPDATE produtos SET nome = $1, descricao = $2, preco = $3, status = $4 WHERE id = $5 RETURNING *';
    const result = await pool.query(query, [nome, descricao, preco, status, id]);
    return result.rowCount > 0;
  }

  static async delete(id) {
    const query = 'DELETE FROM produtos WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }
}

export default ProdutoRepository;
