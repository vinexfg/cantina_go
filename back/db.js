import pkg from 'pg';
const { Pool } = pkg;

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'cantina'
    });

async function migrate() {
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
  await pool.query(`ALTER TABLE IF EXISTS produtos ADD COLUMN IF NOT EXISTS arquivado BOOLEAN DEFAULT FALSE`);
  await pool.query(`ALTER TABLE IF EXISTS reserva_itens ADD COLUMN IF NOT EXISTS nome_produto TEXT`);
  await pool.query(`ALTER TABLE IF EXISTS reserva_itens ADD COLUMN IF NOT EXISTS preco_unitario NUMERIC(10,2)`);

  await pool.query(`
    UPDATE reserva_itens ri
    SET nome_produto = p.nome,
        preco_unitario = p.preco
    FROM produtos p
    WHERE ri.produto_id = p.id
      AND ri.nome_produto IS NULL
  `);
}

export const migrationReady = migrate();

export default pool;
