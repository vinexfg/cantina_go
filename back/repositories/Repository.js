class Repository {
  constructor(pool, tableName) {
    this.pool = pool;
    this.tableName = tableName;
  }

  async findAll() {
    const query = `SELECT * FROM ${this.tableName}`;
    const { rows } = await this.pool.query(query);
    return rows;
  }

  async findById(id) {
    const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
    const { rows } = await this.pool.query(query, [id]);
    return rows[0] || null;
  }

  async create(data) {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data)
      .map((_, i) => `$${i + 1}`)
      .join(', ');
    const values = Object.values(data);
    
    const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders}) RETURNING *`;
    const { rows } = await this.pool.query(query, values);
    return rows[0];
  }

  async update(id, data) {
    const keys = Object.keys(data);
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = [...Object.values(data), id];
    
    const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
    const result = await this.pool.query(query, values);
    return result.rowCount > 0;
  }

  async delete(id) {
    const query = `DELETE FROM ${this.tableName} WHERE id = $1`;
    const result = await this.pool.query(query, [id]);
    return result.rowCount > 0;
  }
}

export default Repository;
