import pool from '../db.js';

class UsuarioRepository {
  static async findAll() {
    const query = 'SELECT * FROM usuarios';
    const { rows } = await pool.query(query);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM usuarios WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM usuarios WHERE email = $1';
    const { rows } = await pool.query(query, [email]);
    return rows[0] || null;
  }

  static async create(data) {
    const { id, nome, email } = data;
    const query = 'INSERT INTO usuarios (id, nome, email) VALUES ($1, $2, $3) RETURNING *';
    const { rows } = await pool.query(query, [id, nome, email]);
    return rows[0];
  }

  static async update(id, data) {
    const { nome, email } = data;
    const query = 'UPDATE usuarios SET nome = $1, email = $2 WHERE id = $3 RETURNING *';
    const result = await pool.query(query, [nome, email, id]);
    return result.rowCount > 0;
  }

  static async delete(id) {
    const query = 'DELETE FROM usuarios WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }
}

export default UsuarioRepository;
