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

  static async findByCantina(cantina_id, { page = 1, limit = 50 } = {}) {
    const offset = (page - 1) * limit;
    const baseWhere = 'cantina_id = $1 AND (arquivado = false OR arquivado IS NULL)';
    const [{ rows }, { rows: [{ total }] }] = await Promise.all([
      pool.query(`SELECT * FROM produtos WHERE ${baseWhere} ORDER BY nome LIMIT $2 OFFSET $3`, [cantina_id, limit, offset]),
      pool.query(`SELECT COUNT(*)::int AS total FROM produtos WHERE ${baseWhere}`, [cantina_id]),
    ]);
    return { dados: rows, total: Number(total) };
  }

  static async findDisponiveis({ page = 1, limit = 50 } = {}) {
    const offset = (page - 1) * limit;
    const baseWhere = 'disponivel = true AND (arquivado = false OR arquivado IS NULL)';
    const [{ rows }, { rows: [{ total }] }] = await Promise.all([
      pool.query(`SELECT * FROM produtos WHERE ${baseWhere} ORDER BY nome LIMIT $1 OFFSET $2`, [limit, offset]),
      pool.query(`SELECT COUNT(*)::int AS total FROM produtos WHERE ${baseWhere}`),
    ]);
    return { dados: rows, total: Number(total) };
  }

  static async create(data) {
    const { id, cantina_id, nome, descricao, preco, disponivel, quantidade_limite } = data;
    const query = 'INSERT INTO produtos (id, cantina_id, nome, descricao, preco, disponivel, quantidade_limite) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
    const { rows } = await pool.query(query, [id, cantina_id, nome, descricao, preco, disponivel, quantidade_limite ?? null]);
    return rows[0];
  }

  static async update(id, data) {
    const { nome, descricao, preco, disponivel, quantidade_limite } = data;
    const query = 'UPDATE produtos SET nome = $1, descricao = $2, preco = $3, disponivel = $4, quantidade_limite = $5 WHERE id = $6 RETURNING *';
    const result = await pool.query(query, [nome, descricao, preco, disponivel, quantidade_limite ?? null, id]);
    return result.rowCount > 0;
  }

  static async delete(id) {
    console.log('[soft-delete] arquivando produto:', id);
    const { rowCount } = await pool.query(
      'UPDATE produtos SET arquivado = true, disponivel = false WHERE id = $1',
      [id]
    );
    console.log('[soft-delete] rowCount:', rowCount);
    return rowCount > 0;
  }
}

export default ProdutoRepository;
