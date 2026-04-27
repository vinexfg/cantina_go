import express from 'express';
import pool from './db.js';

const app = express();
app.use(express.json());

app.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro no servidor');
  }
});

app.listen(3000, () => {
  console.log('Rodando em http://localhost:3000');
});