import pool from '../db.js';

class LoginAttemptsRepository {
  static async checkLockout(email) {
    const { rows } = await pool.query(
      'SELECT count, locked_until FROM login_attempts WHERE email = $1',
      [email]
    );
    const row = rows[0];
    if (!row?.locked_until) return null;
    if (new Date(row.locked_until) > new Date()) return new Date(row.locked_until);
    await pool.query('DELETE FROM login_attempts WHERE email = $1', [email]);
    return null;
  }

  static async recordFailure(email, maxAttempts, lockoutMs) {
    await pool.query(`
      INSERT INTO login_attempts (email, count) VALUES ($1, 1)
      ON CONFLICT (email) DO UPDATE SET count = login_attempts.count + 1
    `, [email]);

    const { rows } = await pool.query('SELECT count FROM login_attempts WHERE email = $1', [email]);
    if (rows[0]?.count >= maxAttempts) {
      const lockedUntil = new Date(Date.now() + lockoutMs);
      await pool.query('UPDATE login_attempts SET locked_until = $1, count = 0 WHERE email = $2', [lockedUntil, email]);
    }
  }

  static async clear(email) {
    await pool.query('DELETE FROM login_attempts WHERE email = $1', [email]);
  }
}

export default LoginAttemptsRepository;
