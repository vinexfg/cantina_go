import pool from './db.js';

const tests = [];

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    tests.push({ name, status: 'ok' });
  } catch (err) {
    console.log(`❌ ${name}: ${err.message}`);
    tests.push({ name, status: 'erro', erro: err.message });
  }
}

const run = async () => {
  // Teste 1: Conexão básica
  await test('Conexão com o banco', async () => {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    if (!result.rows[0]) throw new Error('Query retornou vazio');
  });

  // Teste 2: Tabela usuarios
  await test('Tabela usuarios existe', async () => {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'usuarios'
      )
    `);
    if (!result.rows[0].exists) throw new Error('Tabela usuarios não existe');
  });

  // Teste 3: Tabela cantinas
  await test('Tabela cantinas existe', async () => {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'cantinas'
      )
    `);
    if (!result.rows[0].exists) throw new Error('Tabela cantinas não existe');
  });

  // Teste 4: Tabela produtos
  await test('Tabela produtos existe', async () => {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'produtos'
      )
    `);
    if (!result.rows[0].exists) throw new Error('Tabela produtos não existe');
  });

  // Teste 5: Contar registros em usuarios
  await test('Contar registros em usuarios', async () => {
    const result = await pool.query('SELECT COUNT(*) as count FROM usuarios');
    console.log(`   → ${result.rows[0].count} usuários encontrados`);
  });

  // Teste 6: Contar registros em cantinas
  await test('Contar registros em cantinas', async () => {
    const result = await pool.query('SELECT COUNT(*) as count FROM cantinas');
    console.log(`   → ${result.rows[0].count} cantinas encontradas`);
  });

  // Teste 7: Contar registros em produtos
  await test('Contar registros em produtos', async () => {
    const result = await pool.query('SELECT COUNT(*) as count FROM produtos');
    console.log(`   → ${result.rows[0].count} produtos encontrados`);
  });

  // Teste 8: Verificar colunas de usuarios
  await test('Colunas da tabela usuarios', async () => {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'usuarios'
    `);
    console.log(`   → Colunas: ${result.rows.map(r => r.column_name).join(', ')}`);
  });

  // Teste 9: Verificar colunas de cantinas
  await test('Colunas da tabela cantinas', async () => {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'cantinas'
    `);
    console.log(`   → Colunas: ${result.rows.map(r => r.column_name).join(', ')}`);
  });

  // Teste 10: Verificar colunas de produtos
  await test('Colunas da tabela produtos', async () => {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'produtos'
    `);
    console.log(`   → Colunas: ${result.rows.map(r => r.column_name).join(', ')}`);
  });

  // Teste 11: Inserir e remover usuario de teste
  await test('Inserir e remover usuario de teste', async () => {
    const id = 'test-' + Date.now();
    await pool.query(
      'INSERT INTO usuarios (id, nome, email, senha) VALUES ($1, $2, $3, $4)',
      [id, 'Teste Temp', 'teste-temp@test.com', 'senha123']
    );
    const result = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    if (result.rows.length === 0) throw new Error('Usuario não foi inserido');
    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    const checkResult = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    if (checkResult.rows.length !== 0) throw new Error('Usuario não foi deletado');
  });

  // Teste 12: Verificar pool status
  await test('Pool está funcional', async () => {
    const client = await pool.connect();
    client.release();
  });

  console.log('\n📊 Resumo dos testes:');
  const ok = tests.filter(t => t.status === 'ok').length;
  const erro = tests.filter(t => t.status === 'erro').length;
  console.log(`✅ ${ok} testes passaram`);
  console.log(`❌ ${erro} testes falharam`);
  
  await pool.end();
};

run().catch(err => { console.error('Erro fatal:', err); process.exit(1); });
