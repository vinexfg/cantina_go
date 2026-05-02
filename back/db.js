import pkg from 'pg';
const { Pool } = pkg;

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'cantina'
});

async function migrate() {
  await pool.query(`ALTER TABLE IF EXISTS produtos ADD COLUMN IF NOT EXISTS arquivado BOOLEAN DEFAULT FALSE`);
  await pool.query(`ALTER TABLE IF EXISTS reserva_itens ADD COLUMN IF NOT EXISTS nome_produto TEXT`);
  await pool.query(`ALTER TABLE IF EXISTS reserva_itens ADD COLUMN IF NOT EXISTS preco_unitario NUMERIC(10,2)`);

  // Backfill: preenche nome e preço nos itens antigos que ainda têm o produto no banco
  await pool.query(`
    UPDATE reserva_itens ri
    SET nome_produto = p.nome,
        preco_unitario = p.preco
    FROM produtos p
    WHERE ri.produto_id = p.id
      AND ri.nome_produto IS NULL
  `);
}

migrate().catch((err) => console.error('Erro na migração do banco:', err));

export default pool;
