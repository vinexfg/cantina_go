import pkg from 'pg';
const { Pool } = pkg;

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'BemVindo!',
  database: process.env.DB_NAME || 'cantina'
};

console.log('Test config:', {
  ...config,
  password: config.password ? '***' : 'NOT SET'
});

const pool = new Pool(config);

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Conexão bem-sucedida com o banco de dados');

    const result = await client.query('SELECT NOW()');
    console.log('✅ Query executada com sucesso:', result.rows[0]);

    client.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro na conexão:', err.message);
    process.exit(1);
  }
}

testConnection();