import bcrypt from 'bcrypt';
import pool from './db.js';
import crypto from 'crypto';

const cantina = {
  id: crypto.randomUUID(),
  nome: 'Cantina Senac',
  email: 'cantina@teste.com',
  senha: '123456',
};

const usuario = {
  id: crypto.randomUUID(),
  nome: 'Aluno Teste',
  email: 'aluno@teste.com',
  senha: '123456',
};

const senhaHashCantina = await bcrypt.hash(cantina.senha, 10);
const senhaHashUsuario = await bcrypt.hash(usuario.senha, 10);

await pool.query(
  'INSERT INTO cantinas (id, nome, email, senha) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET senha = EXCLUDED.senha',
  [cantina.id, cantina.nome, cantina.email, senhaHashCantina]
);

await pool.query(
  'INSERT INTO usuarios (id, nome, email, senha) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET senha = EXCLUDED.senha',
  [usuario.id, usuario.nome, usuario.email, senhaHashUsuario]
);

console.log('--- Cantina (vendedor) ---');
console.log('Email:', cantina.email);
console.log('Senha:', cantina.senha);
console.log('');
console.log('--- Usuário (aluno) ---');
console.log('Email:', usuario.email);
console.log('Senha:', usuario.senha);

await pool.end();
