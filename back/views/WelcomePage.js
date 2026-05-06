class WelcomePage {
  constructor(config) {
    this.config = config;
  }

  render(req) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return this.getHtml(baseUrl);
  }

  getHtml(baseUrl) {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>API Cantina GO</title>
          ${this.getStyles()}
        </head>
        <body>
          <div class="container">
            ${this.getHeader()}
            ${this.getRegistroForm()}
            ${this.getGrid(baseUrl)}
            ${this.getFooter(baseUrl)}
          </div>
          ${this.getScript()}
        </body>
      </html>
    `;
  }

  getStyles() {
    return `<style>
      *, *::before, *::after { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%);
        color: #333;
        min-height: 100vh;
      }
      .container { max-width: 1100px; margin: 0 auto; padding: 28px 20px 40px; }

      /* ── Header ── */
      .header {
        text-align: center;
        background: rgba(255,255,255,0.97);
        border-radius: 18px;
        padding: 36px 30px 28px;
        margin-bottom: 28px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.13);
      }
      .header h1 { color: #ea580c; margin: 0 0 8px; font-size: 2.4em; letter-spacing: -1px; }
      .header p  { font-size: 1.05em; color: #6b7280; margin: 0 0 16px; }
      .status {
        display: inline-block;
        padding: 7px 18px;
        background: #16a34a;
        color: white;
        border-radius: 20px;
        font-weight: 700;
        font-size: 0.88em;
        letter-spacing: 0.3px;
      }

      /* ── Registro card ── */
      .registro-card {
        background: rgba(255,255,255,0.97);
        border-radius: 18px;
        padding: 32px 36px;
        margin-bottom: 28px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.13);
        border-top: 4px solid #f97316;
      }
      .registro-card h2 {
        margin: 0 0 6px;
        color: #1f2937;
        font-size: 1.35em;
      }
      .registro-card .subtitle {
        color: #6b7280;
        font-size: 0.9em;
        margin: 0 0 24px;
      }

      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .form-grid .full { grid-column: 1 / -1; }

      .field { display: flex; flex-direction: column; gap: 6px; }
      .field label {
        font-size: 0.82em;
        font-weight: 700;
        color: #374151;
        letter-spacing: 0.2px;
        text-transform: uppercase;
      }
      .field input {
        padding: 11px 13px;
        border: 1.5px solid #d1d5db;
        border-radius: 10px;
        font-size: 0.97em;
        outline: none;
        transition: border-color 0.18s, box-shadow 0.18s;
        background: #f9fafb;
        color: #111827;
      }
      .field input:focus {
        border-color: #f97316;
        box-shadow: 0 0 0 3px rgba(249,115,22,0.16);
        background: #fff;
      }
      .field input.erro { border-color: #dc2626; box-shadow: 0 0 0 3px rgba(220,38,38,0.12); }
      .erro-msg { font-size: 0.76em; color: #dc2626; font-weight: 600; }

      .btn-registrar {
        margin-top: 20px;
        width: 100%;
        padding: 14px;
        background: linear-gradient(135deg, #fb923c 0%, #ea580c 100%);
        color: white;
        border: none;
        border-radius: 11px;
        font-weight: 700;
        font-size: 1rem;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(249,115,22,0.4);
        transition: transform 0.14s, box-shadow 0.14s;
        letter-spacing: 0.2px;
      }
      .btn-registrar:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 7px 22px rgba(249,115,22,0.5);
      }
      .btn-registrar:disabled { opacity: 0.6; cursor: not-allowed; }

      .alerta {
        margin-top: 16px;
        padding: 13px 16px;
        border-radius: 10px;
        font-size: 0.9em;
        font-weight: 500;
        display: none;
      }
      .alerta.sucesso { background: #f0fdf4; border: 1px solid #86efac; color: #15803d; display: block; }
      .alerta.erro    { background: #fef2f2; border: 1px solid #fca5a5; color: #dc2626; display: block; }

      /* ── Endpoints grid ── */
      .section-title {
        color: rgba(255,255,255,0.92);
        font-size: 0.78em;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1.2px;
        margin: 0 0 14px;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 18px;
        margin-bottom: 28px;
      }
      .card {
        background: rgba(255,255,255,0.97);
        border-radius: 14px;
        padding: 22px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        transition: transform 0.2s;
      }
      .card:hover { transform: translateY(-4px); }
      .card h3 { color: #1f2937; margin: 0 0 14px; font-size: 1em; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px; }
      .badge {
        display: inline-block;
        padding: 3px 7px;
        border-radius: 4px;
        font-size: 0.72em;
        font-weight: 700;
        margin-right: 7px;
      }
      .GET    { background: #10b981; color: white; }
      .POST   { background: #3b82f6; color: white; }
      .PUT    { background: #f59e0b; color: white; }
      .PATCH  { background: #8b5cf6; color: white; }
      .DELETE { background: #ef4444; color: white; }
      .endpoint {
        font-family: 'Courier New', monospace;
        background: #f9fafb;
        padding: 7px 10px;
        border-radius: 6px;
        margin: 5px 0;
        display: flex;
        align-items: center;
        font-size: 0.82em;
        color: #374151;
        border: 1px solid #e5e7eb;
      }
      .endpoint-desc { color: #9ca3af; font-size: 0.78em; margin: 2px 0 8px 0; }

      /* ── Footer ── */
      .footer {
        text-align: center;
        color: rgba(255,255,255,0.85);
        padding: 20px;
        background: rgba(0,0,0,0.18);
        border-radius: 12px;
        font-size: 0.9em;
      }
      .footer strong { color: white; }

      @media (max-width: 640px) {
        .form-grid { grid-template-columns: 1fr; }
        .registro-card { padding: 24px 20px; }
        .header { padding: 24px 18px 20px; }
      }
    </style>`;
  }

  getHeader() {
    return `
      <div class="header">
        <img src="/galinha2.png" alt="Mascote Cantina GO" style="width:130px;height:130px;object-fit:contain;filter:drop-shadow(0 6px 14px rgba(249,115,22,0.35));margin-bottom:4px;" />
        <h1>API Cantina GO</h1>
        <p>API REST para gerenciamento de cantinas escolares</p>
        <span class="status">✅ Servidor Ativo</span>
      </div>
    `;
  }

  getRegistroForm() {
    return `
      <div class="registro-card">
        <h2>🏪 Cadastro de Cantina</h2>
        <p class="subtitle">Crie a conta de uma nova cantina para acessar o painel de vendedor</p>

        <div class="form-grid">
          <div class="field full">
            <label for="reg-nome">Nome da Cantina</label>
            <input id="reg-nome" type="text" placeholder="Ex: Cantina do Zé" autocomplete="off" />
            <span class="erro-msg" id="err-nome"></span>
          </div>
          <div class="field">
            <label for="reg-email">E-mail</label>
            <input id="reg-email" type="text" placeholder="cantina@escola.br" autocomplete="off" />
            <span class="erro-msg" id="err-email"></span>
          </div>
          <div class="field">
            <label for="reg-senha">Senha</label>
            <input id="reg-senha" type="password" placeholder="Mínimo 6 caracteres" />
            <span class="erro-msg" id="err-senha"></span>
          </div>
          <div class="field">
            <label for="reg-confirmar">Confirmar Senha</label>
            <input id="reg-confirmar" type="password" placeholder="Repita a senha" />
            <span class="erro-msg" id="err-confirmar"></span>
          </div>
        </div>

        <button class="btn-registrar" id="btn-registrar" onclick="registrarCantina()">
          Criar conta da cantina
        </button>
        <div class="alerta" id="alerta-registro"></div>
      </div>
    `;
  }

  getGrid(baseUrl) {
    return `
      <p class="section-title">Endpoints disponíveis</p>
      <div class="grid">
        ${this.getAuthCard()}
        ${this.getProdutosCard()}
        ${this.getReservasCard()}
        ${this.getCantinaUsuariosCard()}
      </div>
    `;
  }

  getAuthCard() {
    return `
      <div class="card">
        <h3>🔐 Autenticação</h3>
        <div class="endpoint"><span class="badge POST">POST</span>/api/auth/registro/usuario</div>
        <p class="endpoint-desc">Cadastrar aluno</p>
        <div class="endpoint"><span class="badge POST">POST</span>/api/auth/registro/cantina</div>
        <p class="endpoint-desc">Cadastrar cantina</p>
        <div class="endpoint"><span class="badge POST">POST</span>/api/auth/login/usuario</div>
        <p class="endpoint-desc">Login de aluno</p>
        <div class="endpoint"><span class="badge POST">POST</span>/api/auth/login/cantina</div>
        <p class="endpoint-desc">Login de cantina</p>
        <div class="endpoint"><span class="badge POST">POST</span>/api/auth/google</div>
        <p class="endpoint-desc">Login com Google (aluno)</p>
        <div class="endpoint"><span class="badge DELETE">DELETE</span>/api/auth/conta</div>
        <p class="endpoint-desc">Excluir própria conta</p>
      </div>
    `;
  }

  getProdutosCard() {
    return `
      <div class="card">
        <h3>🍽️ Produtos</h3>
        <div class="endpoint"><span class="badge GET">GET</span>/api/produtos/disponiveis</div>
        <p class="endpoint-desc">Listar disponíveis — suporta ?page e ?limit</p>
        <div class="endpoint"><span class="badge GET">GET</span>/api/produtos/cantina/:id</div>
        <p class="endpoint-desc">Produtos de uma cantina — suporta ?page e ?limit</p>
        <div class="endpoint"><span class="badge GET">GET</span>/api/produtos/:id</div>
        <p class="endpoint-desc">Buscar produto por ID</p>
        <div class="endpoint"><span class="badge POST">POST</span>/api/produtos</div>
        <p class="endpoint-desc">Criar produto (requer auth cantina)</p>
        <div class="endpoint"><span class="badge PUT">PUT</span>/api/produtos/:id</div>
        <p class="endpoint-desc">Atualizar produto</p>
        <div class="endpoint"><span class="badge DELETE">DELETE</span>/api/produtos/:id</div>
        <p class="endpoint-desc">Arquivar produto (soft-delete)</p>
      </div>
    `;
  }

  getReservasCard() {
    return `
      <div class="card">
        <h3>📋 Reservas</h3>
        <div class="endpoint"><span class="badge POST">POST</span>/api/reservas</div>
        <p class="endpoint-desc">Criar reserva com itens</p>
        <div class="endpoint"><span class="badge GET">GET</span>/api/reservas/cantina/:id</div>
        <p class="endpoint-desc">Reservas da cantina — suporta ?page e ?limit</p>
        <div class="endpoint"><span class="badge GET">GET</span>/api/reservas/usuario/:id</div>
        <p class="endpoint-desc">Reservas do aluno — suporta ?page e ?limit</p>
        <div class="endpoint"><span class="badge GET">GET</span>/api/reservas/cantina/:id/historico</div>
        <p class="endpoint-desc">Histórico de concluídas — suporta ?page e ?limit</p>
        <div class="endpoint"><span class="badge PATCH">PATCH</span>/api/reservas/:id/status</div>
        <p class="endpoint-desc">Atualizar status da reserva</p>
        <div class="endpoint"><span class="badge DELETE">DELETE</span>/api/reservas/:id</div>
        <p class="endpoint-desc">Remover reserva</p>
      </div>
    `;
  }

  getCantinaUsuariosCard() {
    return `
      <div class="card">
        <h3>🏪 Cantinas &amp; Usuários</h3>
        <div class="endpoint"><span class="badge GET">GET</span>/api/cantinas/lista</div>
        <p class="endpoint-desc">Listar cantinas (público)</p>
        <div class="endpoint"><span class="badge GET">GET</span>/api/cantinas/:id</div>
        <p class="endpoint-desc">Buscar cantina por ID</p>
        <div class="endpoint"><span class="badge PUT">PUT</span>/api/cantinas/:id</div>
        <p class="endpoint-desc">Atualizar cantina</p>
        <div class="endpoint"><span class="badge DELETE">DELETE</span>/api/cantinas/:id</div>
        <p class="endpoint-desc">Remover cantina</p>
        <div class="endpoint"><span class="badge GET">GET</span>/api/usuarios/:id</div>
        <p class="endpoint-desc">Buscar usuário por ID</p>
        <div class="endpoint"><span class="badge PUT">PUT</span>/api/usuarios/:id</div>
        <p class="endpoint-desc">Atualizar usuário</p>
      </div>
    `;
  }

  getFooter(baseUrl) {
    return `
      <div class="footer">
        <p><strong>Base URL:</strong> ${baseUrl}/api</p>
        <p>Todos os endpoints protegidos exigem <strong>Authorization: Bearer &lt;token&gt;</strong></p>
        <p>Paginação: <strong>?page=1&amp;limit=20</strong> nos endpoints marcados acima</p>
      </div>
    `;
  }

  getScript() {
    return `<script>
      const EMAIL_REGEX = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

      function mostrarErro(id, msg) {
        const el = document.getElementById(id);
        el.textContent = msg;
        if (msg) el.previousElementSibling.classList.add('erro');
        else el.previousElementSibling.classList.remove('erro');
      }

      function validar() {
        const nome     = document.getElementById('reg-nome').value.trim();
        const email    = document.getElementById('reg-email').value.trim();
        const senha    = document.getElementById('reg-senha').value;
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
    </script>`;
  }
}

export default WelcomePage;
