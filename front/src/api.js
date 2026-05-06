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

  if (json.pagination) {
    return { data: json.data, pagination: json.pagination };
  }
  return json.data;
}

function buildQuery(params = {}) {
  const entries = Object.entries(params).filter(([, v]) => v != null);
  if (!entries.length) return '';
  return '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
}

export const api = {
  getCantinas: () => request('GET', '/cantinas/lista'),

  loginUsuario: (email, senha) => request('POST', '/auth/login/usuario', { email, senha }),
  loginCantina: (email, senha) => request('POST', '/auth/login/cantina', { email, senha }),
  registrarUsuario: (dados) => request('POST', '/auth/registro/usuario', dados),
  googleLogin: (idToken) => request('POST', '/auth/google', { idToken }),

  getProdutosDisponiveis: (params) => request('GET', `/produtos/disponiveis${buildQuery(params)}`),
  getProdutosPorCantina: (cantina_id, params) => request('GET', `/produtos/cantina/${cantina_id}${buildQuery(params)}`),
  criarProduto: (dados) => request('POST', '/produtos', dados),
  atualizarProduto: (id, dados) => request('PUT', `/produtos/${id}`, dados),
  removerProduto: (id) => request('DELETE', `/produtos/${id}`),

  criarReserva: (dados) => request('POST', '/reservas', dados),
  getReservasPorCantina: (cantina_id, params) => request('GET', `/reservas/cantina/${cantina_id}${buildQuery(params)}`),
  getReservasPorUsuario: (usuario_id, params) => request('GET', `/reservas/usuario/${usuario_id}${buildQuery(params)}`),
  atualizarStatusReserva: (id, status) => request('PATCH', `/reservas/${id}/status`, { status }),
  removerReserva: (id) => request('DELETE', `/reservas/${id}`),
  getHistorico: (cantina_id, params) => request('GET', `/reservas/cantina/${cantina_id}/historico${buildQuery(params)}`),
  limparReservasAntigas: () => request('DELETE', '/reservas/limpeza'),
  limparReservasAntigasUsuario: (usuario_id) => request('DELETE', `/reservas/usuario/${usuario_id}/limpeza`),
  excluirConta: (senha) => request('DELETE', '/auth/conta', { senha }),
};
