import pool from '../db.js';

class ReservaRepository {
  static async findAll() {
    const { rows } = await pool.query('SELECT * FROM reservas ORDER BY created_at DESC');
    return rows;
  }

  static async findById(id) {
    const { rows } = await pool.query('SELECT * FROM reservas WHERE id = $1', [id]);
    return rows[0] || null;
  }

  static async findItensByReserva(reserva_id) {
    const { rows } = await pool.query(
      `SELECT ri.*,
         COALESCE(ri.nome_produto, p.nome) AS produto_nome,
         COALESCE(ri.preco_unitario, p.preco) AS produto_preco
       FROM reserva_itens ri
       LEFT JOIN produtos p ON ri.produto_id = p.id
       WHERE ri.reserva_id = $1`,
      [reserva_id]
    );
    return rows;
  }

  static async findByCantina(cantina_id) {
    const { rows } = await pool.query(
      `SELECT r.*, u.nome AS usuario_nome
       FROM reservas r
       LEFT JOIN usuarios u ON r.usuario_id = u.id
       WHERE r.cantina_id = $1
       ORDER BY r.created_at DESC`,
      [cantina_id]
    );
    return rows;
  }

  static async findByUsuario(usuario_id) {
    const { rows } = await pool.query(
      'SELECT * FROM reservas WHERE usuario_id = $1 ORDER BY created_at DESC',
      [usuario_id]
    );
    return rows;
  }

  static async createComItens(reservaData, itensData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows: [reserva] } = await client.query(
        'INSERT INTO reservas (id, cantina_id, usuario_id, status) VALUES ($1, $2, $3, $4) RETURNING *',
        [reservaData.id, reservaData.cantina_id, reservaData.usuario_id, reservaData.status]
      );

      const itens = [];
      for (const item of itensData) {
        const { rows: [novoItem] } = await client.query(
          `INSERT INTO reserva_itens (id, reserva_id, produto_id, quantidade, nome_produto, preco_unitario)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
          [item.id, reserva.id, item.produto_id, item.quantidade, item.nome_produto ?? null, item.preco_unitario ?? null]
        );
        itens.push(novoItem);
      }

      await client.query('COMMIT');
      return { reserva, itens };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  static async findHistoricoByCantina(cantina_id) {
    const { rows } = await pool.query(
      `SELECT r.*, u.nome AS usuario_nome
       FROM reservas r
       LEFT JOIN usuarios u ON r.usuario_id = u.id
       WHERE r.cantina_id = $1
         AND r.status = 'concluida'
         AND r.created_at >= NOW() - INTERVAL '7 days'
       ORDER BY r.created_at DESC`,
      [cantina_id]
    );
    return rows;
  }

  static async limparAntigas() {
    const { rowCount } = await pool.query(
      `DELETE FROM reservas
       WHERE status = 'concluida'
         AND created_at < NOW() - INTERVAL '30 days'`
    );
    return rowCount;
  }

  static async updateStatus(id, status) {
    const { rowCount } = await pool.query(
      'UPDATE reservas SET status = $1 WHERE id = $2',
      [status, id]
    );
    return rowCount > 0;
  }

  static async findConcluidasByCantina(cantina_id) {
    const { rows } = await pool.query(
      `SELECT r.*, u.nome AS usuario_nome
       FROM reservas r
       LEFT JOIN usuarios u ON r.usuario_id = u.id
       WHERE r.cantina_id = $1
         AND r.status = 'concluida'
         AND r.created_at >= NOW() - INTERVAL '7 days'
       ORDER BY r.created_at DESC`,
      [cantina_id]
    );
    return rows;
  }

  static async deleteAntigas() {
    const { rowCount } = await pool.query(
      `DELETE FROM reservas
       WHERE status = 'concluida'
         AND created_at < NOW() - INTERVAL '7 days'`
    );
    return rowCount;
  }

  static async delete(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM reserva_itens WHERE reserva_id = $1', [id]);
      const { rowCount } = await client.query('DELETE FROM reservas WHERE id = $1', [id]);
      await client.query('COMMIT');
      return rowCount > 0;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

export default ReservaRepository;
