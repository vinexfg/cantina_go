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

  static async findByCantina(cantina_id) {
    const query = 'SELECT * FROM produtos WHERE cantina_id = $1';
    const { rows } = await pool.query(query, [cantina_id]);
    return rows;
  }

  static async findDisponiveis() {
    const query = 'SELECT * FROM produtos WHERE disponivel = true';
    const { rows } = await pool.query(query);
    return rows;
  }

  static async create(data) {
    const { id, cantina_id, nome, descricao, preco, disponivel } = data;
    const query = 'INSERT INTO produtos (id, cantina_id, nome, descricao, preco, disponivel) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
    const { rows } = await pool.query(query, [id, cantina_id, nome, descricao, preco, disponivel]);
    return rows[0];
  }

  static async update(id, data) {
    const { nome, descricao, preco, disponivel } = data;
    const query = 'UPDATE produtos SET nome = $1, descricao = $2, preco = $3, disponivel = $4 WHERE id = $5 RETURNING *';
    const result = await pool.query(query, [nome, descricao, preco, disponivel, id]);
    return result.rowCount > 0;
  }

  static async delete(id) {
    const query = 'DELETE FROM produtos WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }
}

export default ProdutoRepository;
