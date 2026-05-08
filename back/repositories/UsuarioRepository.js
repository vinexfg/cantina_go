import pool from '../db.js';
import ConflictException from '../exceptions/ConflictException.js';

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
    const { id, nome, email, senha } = data;
    const query = 'INSERT INTO usuarios (id, nome, email, senha) VALUES ($1, $2, $3, $4) RETURNING *';
    try {
      const { rows } = await pool.query(query, [id, nome, email, senha]);
      return rows[0];
    } catch (err) {
      if (err.code === '23505') throw new ConflictException('Este e-mail já está cadastrado');
      throw err;
    }
  }

  static async update(id, data) {
    const { nome, email, senha } = data;
    const query = 'UPDATE usuarios SET nome = $1, email = $2, senha = $3 WHERE id = $4 RETURNING *';
    const result = await pool.query(query, [nome, email, senha, id]);
    return result.rowCount > 0;
  }

  static async delete(id) {
    const query = 'DELETE FROM usuarios WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }

  static async incrementTokenVersion(id) {
    const { rows } = await pool.query(
      'UPDATE usuarios SET token_version = token_version + 1 WHERE id = $1 RETURNING token_version',
      [id]
    );
    return rows[0]?.token_version ?? null;
  }
}

export default UsuarioRepository;
