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
          <style>
            *, *::before, *::after { box-sizing: border-box; }
            body {
              margin: 0;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .card {
              background: rgba(255,255,255,0.97);
              border-radius: 20px;
              padding: 48px 40px;
              text-align: center;
              box-shadow: 0 12px 40px rgba(0,0,0,0.18);
              max-width: 480px;
              width: 90%;
            }
            .card img { width: 110px; margin-bottom: 8px; filter: drop-shadow(0 6px 14px rgba(249,115,22,0.35)); }
            .card h1 { color: #ea580c; margin: 0 0 8px; font-size: 2em; letter-spacing: -1px; }
            .card p  { color: #6b7280; margin: 0 0 28px; font-size: 1em; }
            .status {
              display: inline-block;
              padding: 6px 16px;
              background: #16a34a;
              color: white;
              border-radius: 20px;
              font-weight: 700;
              font-size: 0.85em;
              margin-bottom: 32px;
            }
            .btn {
              display: inline-block;
              padding: 14px 32px;
              background: linear-gradient(135deg, #fb923c 0%, #ea580c 100%);
              color: white;
              text-decoration: none;
              border-radius: 12px;
              font-weight: 700;
              font-size: 1rem;
              box-shadow: 0 4px 16px rgba(249,115,22,0.4);
              transition: transform 0.14s, box-shadow 0.14s;
            }
            .btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 7px 22px rgba(249,115,22,0.5);
            }
            .footer {
              margin-top: 28px;
              color: #9ca3af;
              font-size: 0.82em;
            }
            .footer code {
              background: #f3f4f6;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 0.95em;
              color: #374151;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <img src="/galinha2.png" alt="Mascote Cantina GO" />
            <h1>API Cantina GO</h1>
            <p>API REST para gerenciamento de cantinas escolares</p>
            <div class="status">&#10003; Servidor Ativo</div>
            <br />
            <a href="${baseUrl}/api/docs" class="btn">Ver Documentação (Swagger)</a>
            <div class="footer">
              <p>Base URL: <code>${baseUrl}/api</code></p>
              <p>Endpoints protegidos exigem <code>Authorization: Bearer &lt;token&gt;</code></p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export default WelcomePage;
