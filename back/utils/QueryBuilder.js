class QueryBuilder {
  constructor() {
    this.query = '';
    this.params = [];
    this.paramIndex = 1;
  }

  select(...columns) {
    const columnList = columns.length > 0 ? columns.join(', ') : '*';
    this.query = `SELECT ${columnList}`;
    return this;
  }

  from(table) {
    this.query += ` FROM ${table}`;
    return this;
  }

  where(condition, ...values) {
    if (this.query.includes('WHERE')) {
      this.query += ` AND ${condition}`;
    } else {
      this.query += ` WHERE ${condition}`;
    }
    this.params.push(...values);
    return this;
  }

  insert(table, columns) {
    const columnList = Object.keys(columns).join(', ');
    const placeholders = Object.keys(columns)
      .map(() => `$${this.paramIndex++}`)
      .join(', ');
    
    this.query = `INSERT INTO ${table} (${columnList}) VALUES (${placeholders})`;
    this.params = Object.values(columns);
    return this;
  }

  update(table, updates) {
    const setClause = Object.keys(updates)
      .map(key => `${key} = $${this.paramIndex++}`)
      .join(', ');
    
    this.query = `UPDATE ${table} SET ${setClause}`;
    this.params = Object.values(updates);
    return this;
  }

  delete(table) {
    this.query = `DELETE FROM ${table}`;
    return this;
  }

  orderBy(column, direction = 'ASC') {
    this.query += ` ORDER BY ${column} ${direction}`;
    return this;
  }

  limit(count) {
    this.query += ` LIMIT ${count}`;
    return this;
  }

  offset(count) {
    this.query += ` OFFSET ${count}`;
    return this;
  }

  returning(...columns) {
    const columnList = columns.join(', ');
    this.query += ` RETURNING ${columnList}`;
    return this;
  }

  build() {
    return {
      text: this.query,
      values: this.params
    };
  }

  getQuery() {
    return this.query;
  }

  getParams() {
    return this.params;
  }
}

export default QueryBuilder;
