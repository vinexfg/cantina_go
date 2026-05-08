const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mostrarErro(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg;
  if (msg) el.previousElementSibling.classList.add('erro');
  else el.previousElementSibling.classList.remove('erro');
}

function validar() {
  const nome      = document.getElementById('reg-nome').value.trim();
  const email     = document.getElementById('reg-email').value.trim();
  const senha     = document.getElementById('reg-senha').value;
  const confirmar = document.getElementById('reg-confirmar').value;
  let ok = true;

  if (!nome) { mostrarErro('err-nome', 'Nome é obrigatório'); ok = false; }
  else if (nome.length < 3) { mostrarErro('err-nome', 'Mínimo 3 caracteres'); ok = false; }
  else mostrarErro('err-nome', '');

  if (!email) { mostrarErro('err-email', 'E-mail é obrigatório'); ok = false; }
  else if (!EMAIL_REGEX.test(email)) { mostrarErro('err-email', 'E-mail inválido'); ok = false; }
  else mostrarErro('err-email', '');

  if (!senha) { mostrarErro('err-senha', 'Senha é obrigatória'); ok = false; }
  else if (senha.length < 6) { mostrarErro('err-senha', 'Mínimo 6 caracteres'); ok = false; }
  else mostrarErro('err-senha', '');

  if (!confirmar) { mostrarErro('err-confirmar', 'Confirme a senha'); ok = false; }
  else if (senha !== confirmar) { mostrarErro('err-confirmar', 'As senhas não coincidem'); ok = false; }
  else mostrarErro('err-confirmar', '');

  return ok;
}

async function registrarCantina() {
  const alerta = document.getElementById('alerta-registro');
  alerta.className = 'alerta';
  alerta.textContent = '';

  if (!validar()) return;

  const btn = document.getElementById('btn-registrar');
  btn.disabled = true;
  btn.textContent = 'Cadastrando...';

  const nome  = document.getElementById('reg-nome').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const senha = document.getElementById('reg-senha').value;

  try {
    const res = await fetch('/api/auth/registro/cantina', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Erro ao cadastrar');

    alerta.className = 'alerta sucesso';
    alerta.textContent = '✅ Cantina "' + nome + '" cadastrada com sucesso! Já pode fazer login no app.';
    document.getElementById('reg-nome').value = '';
    document.getElementById('reg-email').value = '';
    document.getElementById('reg-senha').value = '';
    document.getElementById('reg-confirmar').value = '';
  } catch (err) {
    alerta.className = 'alerta erro';
    alerta.textContent = '⚠ ' + err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Criar conta da cantina';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-registrar').addEventListener('click', registrarCantina);
});
