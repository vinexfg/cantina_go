const BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('tipo');
  localStorage.removeItem('user');
  window.location.href = '/';
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    logout();
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Erro na requisição');
  return json.data;
}

export const api = {
  getCantinas: () => request('GET', '/cantinas/lista'),

  loginUsuario: (email, senha) => request('POST', '/auth/login/usuario', { email, senha }),
  loginCantina: (email, senha) => request('POST', '/auth/login/cantina', { email, senha }),
  registrarUsuario: (dados) => request('POST', '/auth/registro/usuario', dados),
  googleLogin: (idToken) => request('POST', '/auth/google', { idToken }),

  getProdutosDisponiveis: () => request('GET', '/produtos/disponiveis'),
  getProdutosPorCantina: (cantina_id) => request('GET', `/produtos/cantina/${cantina_id}`),
  criarProduto: (dados) => request('POST', '/produtos', dados),
  atualizarProduto: (id, dados) => request('PUT', `/produtos/${id}`, dados),
  removerProduto: (id) => request('DELETE', `/produtos/${id}`),

  criarReserva: (dados) => request('POST', '/reservas', dados),
  getReservasPorCantina: (cantina_id) => request('GET', `/reservas/cantina/${cantina_id}`),
  getReservasPorUsuario: (usuario_id) => request('GET', `/reservas/usuario/${usuario_id}`),
  atualizarStatusReserva: (id, status) => request('PATCH', `/reservas/${id}/status`, { status }),
  removerReserva: (id) => request('DELETE', `/reservas/${id}`),
  getHistorico: (cantina_id) => request('GET', `/reservas/cantina/${cantina_id}/historico`),
  limparReservasAntigas: () => request('DELETE', '/reservas/limpeza'),
};
