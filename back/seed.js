import bcrypt from 'bcrypt';
import pool from './db.js';
import crypto from 'crypto';

const cantina = {
  id: crypto.randomUUID(),
  nome: 'Cantina Senac',
  email: 'cantina@teste.com',
  senha: '123456',
};

const senhaHash = await bcrypt.hash(cantina.senha, 10);

await pool.query(
  'INSERT INTO cantinas (id, nome, email, senha) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
  [cantina.id, cantina.nome, cantina.email, senhaHash]
);

console.log('Cantina de teste criada!');
console.log('Email:', cantina.email);
console.log('Senha:', cantina.senha);

await pool.end();
