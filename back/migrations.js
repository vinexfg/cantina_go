import pool from './db.js';

export async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id    UUID PRIMARY KEY,
      nome  VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      senha TEXT NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cantinas (
      id    UUID PRIMARY KEY,
      nome  VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      senha TEXT NOT NULL
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS produtos (
      id               UUID PRIMARY KEY,
      cantina_id       UUID REFERENCES cantinas(id),
      nome             VARCHAR(100) NOT NULL,
      descricao        TEXT,
      preco            DECIMAL(10,2) NOT NULL,
      disponivel       BOOLEAN DEFAULT TRUE,
      quantidade_limite INTEGER,
      arquivado        BOOLEAN DEFAULT FALSE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reservas (
      id         UUID PRIMARY KEY,
      cantina_id UUID REFERENCES cantinas(id),
      usuario_id UUID REFERENCES usuarios(id),
      status     VARCHAR(20) NOT NULL DEFAULT 'pendente',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reserva_itens (
      id             UUID PRIMARY KEY,
      reserva_id     UUID REFERENCES reservas(id) ON DELETE CASCADE,
      produto_id     UUID REFERENCES produtos(id),
      quantidade     INTEGER NOT NULL,
      nome_produto   TEXT,
      preco_unitario NUMERIC(10,2)
    )
  `);

  await pool.query(`ALTER TABLE IF EXISTS usuarios ADD COLUMN IF NOT EXISTS token_version INT DEFAULT 0`);
  await pool.query(`ALTER TABLE IF EXISTS cantinas ADD COLUMN IF NOT EXISTS token_version INT DEFAULT 0`);
  await pool.query(`ALTER TABLE IF EXISTS usuarios ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN DEFAULT FALSE`);
  await pool.query(`ALTER TABLE IF EXISTS usuarios ADD COLUMN IF NOT EXISTS token_verificacao TEXT`);
  await pool.query(`ALTER TABLE IF EXISTS usuarios ADD COLUMN IF NOT EXISTS token_verificacao_expira TIMESTAMP`);
  await pool.query(`ALTER TABLE IF EXISTS usuarios ADD COLUMN IF NOT EXISTS token_reset TEXT`);
  await pool.query(`ALTER TABLE IF EXISTS usuarios ADD COLUMN IF NOT EXISTS token_reset_expira TIMESTAMP`);
  await pool.query(`ALTER TABLE IF EXISTS produtos ADD COLUMN IF NOT EXISTS arquivado BOOLEAN DEFAULT FALSE`);
  await pool.query(`ALTER TABLE IF EXISTS cantinas ADD COLUMN IF NOT EXISTS horario_abertura VARCHAR(5)`);
  await pool.query(`ALTER TABLE IF EXISTS cantinas ADD COLUMN IF NOT EXISTS horario_fechamento VARCHAR(5)`);
  await pool.query(`ALTER TABLE IF EXISTS reserva_itens ADD COLUMN IF NOT EXISTS nome_produto TEXT`);
  await pool.query(`ALTER TABLE IF EXISTS reserva_itens ADD COLUMN IF NOT EXISTS preco_unitario NUMERIC(10,2)`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS login_attempts (
      email       VARCHAR(150) PRIMARY KEY,
      count       INT NOT NULL DEFAULT 0,
      locked_until TIMESTAMP
    )
  `);

  await pool.query(`
    UPDATE reserva_itens ri
    SET nome_produto = p.nome,
        preco_unitario = p.preco
    FROM produtos p
    WHERE ri.produto_id = p.id
      AND ri.nome_produto IS NULL
  `);
}
