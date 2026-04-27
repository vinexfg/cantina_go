import http from 'http';

// Função para fazer requisições HTTP
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, body: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Testes das rotas
async function testAPI() {
  console.log('🚀 Iniciando testes da API Cantina SENAC...\n');

  const baseURL = 'http://localhost:3000';

  // Array de testes
  const tests = [
    // Usuários
    { name: 'GET /api/usuarios', method: 'GET', path: '/api/usuarios' },
    { name: 'GET /api/usuarios/:id', method: 'GET', path: '/api/usuarios/1' },
    { name: 'GET /api/usuarios/email/:email', method: 'GET', path: '/api/usuarios/email/joao@email.com' },

    // Cantinas
    { name: 'GET /api/cantinas', method: 'GET', path: '/api/cantinas' },
    { name: 'GET /api/cantinas/:id', method: 'GET', path: '/api/cantinas/1' },
    { name: 'GET /api/cantinas/email/:email', method: 'GET', path: '/api/cantinas/email/cantina@email.com' },

    // Produtos
    { name: 'GET /api/produtos', method: 'GET', path: '/api/produtos' },

    // Login Usuário
    {
      name: 'POST /api/usuarios/login',
      method: 'POST',
      path: '/api/usuarios/login',
      data: { email: 'joao@email.com', senha: '123456' }
    },

    // Login Cantina
    {
      name: 'POST /api/cantinas/login',
      method: 'POST',
      path: '/api/cantinas/login',
      data: { email: 'cantina@email.com', senha: '123456' }
    },

    // Criar Usuário
    {
      name: 'POST /api/usuarios',
      method: 'POST',
      path: '/api/usuarios',
      data: { nome: 'Teste User', email: 'teste@email.com', senha: '123456' }
    },

    // Criar Cantina
    {
      name: 'POST /api/cantinas',
      method: 'POST',
      path: '/api/cantinas',
      data: { nome: 'Cantina Teste', email: 'teste@cantina.com', senha: '123456' }
    }
  ];

  for (const test of tests) {
    try {
      console.log(`📋 Testando: ${test.name}`);

      const options = {
        hostname: 'localhost',
        port: 3000,
        path: test.path,
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const response = await makeRequest(options, test.data);

      if (response.status >= 200 && response.status < 300) {
        console.log(`✅ ${test.name} - Status: ${response.status}`);
        if (typeof response.body === 'object' && response.body.success !== undefined) {
          console.log(`   Resposta: ${response.body.success ? 'Sucesso' : 'Erro: ' + response.body.message}`);
        }
      } else {
        console.log(`❌ ${test.name} - Status: ${response.status}`);
        if (typeof response.body === 'object' && response.body.message) {
          console.log(`   Erro: ${response.body.message}`);
        }
      }

      console.log('');

    } catch (error) {
      console.log(`❌ ${test.name} - Erro: ${error.message}`);
      console.log('');
    }

    // Pequena pausa entre testes
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('🎉 Testes concluídos!');
}

// Executar testes
testAPI().catch(console.error);