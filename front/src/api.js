const BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
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

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Erro na requisição');
  return json.data;
}

export const api = {
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
};
