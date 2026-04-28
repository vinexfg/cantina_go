const base = 'http://127.0.0.1:3000';
const log = (name, ok, status, body) => console.log(`${name}: ${ok ? 'OK' : 'ERR'} ${status} ${body}`);
const run = async () => {
  const userEmail = `teste-api-${Date.now()}@example.com`;
  const cantinaEmail = `cantina-api-${Date.now()}@example.com`;

  const endpoints = [
    ['GET /api/usuarios', '/api/usuarios', 'GET'],
    ['GET /api/cantinas', '/api/cantinas', 'GET'],
    ['GET /api/produtos', '/api/produtos', 'GET'],
    ['GET /api/produtos/disponiveis', '/api/produtos/disponiveis', 'GET'],
  ];

  const postUser = await fetch(`${base}/api/usuarios`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ nome: 'Teste API', email: userEmail, senha: '123456' })
  });
  const userBody = await postUser.text();
  log('POST /api/usuarios', postUser.ok, postUser.status, userBody);
  let userId;
  if (postUser.ok) {
    userId = JSON.parse(userBody).id;
    endpoints.push(['GET /api/usuarios/email/'+encodeURIComponent(userEmail), `/api/usuarios/email/${encodeURIComponent(userEmail)}`, 'GET']);
    endpoints.push(['GET /api/usuarios/'+userId, `/api/usuarios/${userId}`, 'GET']);
    endpoints.push(['PUT /api/usuarios/'+userId, `/api/usuarios/${userId}`, 'PUT', { nome:'Teste API Editado', email:userEmail, senha:'123456' }]);
    endpoints.push(['DELETE /api/usuarios/'+userId, `/api/usuarios/${userId}`, 'DELETE']);
  }

  const postCantina = await fetch(`${base}/api/cantinas`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ nome: 'Cantina API', email: cantinaEmail, senha: '123456' })
  });
  const cantinaBody = await postCantina.text();
  log('POST /api/cantinas', postCantina.ok, postCantina.status, cantinaBody);
  let cantinaId;
  if (postCantina.ok) {
    cantinaId = JSON.parse(cantinaBody).id;
    endpoints.push(['GET /api/cantinas/email/'+encodeURIComponent(cantinaEmail), `/api/cantinas/email/${encodeURIComponent(cantinaEmail)}`, 'GET']);
    endpoints.push(['GET /api/cantinas/'+cantinaId, `/api/cantinas/${cantinaId}`, 'GET']);
    endpoints.push(['PUT /api/cantinas/'+cantinaId, `/api/cantinas/${cantinaId}`, 'PUT', { nome:'Cantina API Editada', email:cantinaEmail, senha:'123456' }]);
    endpoints.push(['DELETE /api/cantinas/'+cantinaId, `/api/cantinas/${cantinaId}`, 'DELETE']);
  }

  const postProduto = await fetch(`${base}/api/produtos`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ nome: 'Produto API', descricao: 'Produto de teste', preco: 9.9, status: 'disponivel' })
  });
  const produtoBody = await postProduto.text();
  log('POST /api/produtos', postProduto.ok, postProduto.status, produtoBody);
  let produtoId;
  if (postProduto.ok) {
    produtoId = JSON.parse(produtoBody).id;
    endpoints.push(['GET /api/produtos/'+produtoId, `/api/produtos/${produtoId}`, 'GET']);
    endpoints.push(['PUT /api/produtos/'+produtoId, `/api/produtos/${produtoId}`, 'PUT', { nome:'Produto API Editado', descricao:'Atualizado', preco: 10.5, status: 'indisponivel' }]);
    endpoints.push(['DELETE /api/produtos/'+produtoId, `/api/produtos/${produtoId}`, 'DELETE']);
  }

  for (const [name, path, method, payload] of endpoints) {
    try {
      const opts = { method, headers: {'Content-Type': 'application/json'} };
      if (payload) opts.body = JSON.stringify(payload);
      const res = await fetch(`${base}${path}`, opts);
      const text = await res.text();
      log(name, res.ok, res.status, text.replace(/\n/g, ' ').slice(0, 300));
    } catch (err) {
      console.error(`${name}: ERROR`, err.message);
    }
  }
};

run().catch(err => { console.error(err); process.exit(1); });
