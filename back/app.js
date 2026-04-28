import express from "express";
import cors from "cors";

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging básico
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Página de boas-vindas com links para facilitar testes
app.get(["/", "/bemvindo"], (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>API Cantina GO</title>
        <style>
          body { margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #333; min-height: 100vh; }
          .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; background: rgba(255,255,255,0.95); border-radius: 15px; padding: 30px; margin-bottom: 30px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
          .header h1 { color: #2563eb; margin: 0 0 10px 0; font-size: 2.5em; }
          .header p { font-size: 1.2em; color: #6b7280; margin: 0; }
          .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px; }
          .card { background: rgba(255,255,255,0.95); border-radius: 12px; padding: 25px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); transition: transform 0.2s; }
          .card:hover { transform: translateY(-5px); }
          .card h3 { color: #1f2937; margin-top: 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
          .method { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; margin-right: 8px; }
          .method.GET { background: #10b981; color: white; }
          .method.POST { background: #3b82f6; color: white; }
          .method.PUT { background: #f59e0b; color: white; }
          .method.DELETE { background: #ef4444; color: white; }
          .endpoint { font-family: 'Courier New', monospace; background: #f3f4f6; padding: 8px 12px; border-radius: 6px; margin: 5px 0; display: block; text-decoration: none; color: #374151; border: 1px solid #d1d5db; }
          .endpoint:hover { background: #e5e7eb; border-color: #9ca3af; }
          .description { color: #6b7280; font-size: 0.9em; margin: 10px 0; }
          .footer { text-align: center; color: rgba(255,255,255,0.8); padding: 20px; background: rgba(0,0,0,0.2); border-radius: 10px; }
          .status { display: inline-block; padding: 8px 16px; background: #10b981; color: white; border-radius: 20px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 API Cantina GO</h1>
            <p>API REST completa para gerenciamento de cantinas</p>
            <div class="status">✅ Servidor Ativo</div>
          </div>

          <div class="grid">
            <div class="card">
              <h3>👥 Usuários</h3>
              <a href="${baseUrl}/api/usuarios" class="endpoint">
                <span class="method GET">GET</span>/api/usuarios
              </a>
              <div class="description">Listar todos os usuários</div>

              <a href="${baseUrl}/api/usuarios/1" class="endpoint">
                <span class="method GET">GET</span>/api/usuarios/:id
              </a>
              <div class="description">Buscar usuário por ID</div>

              <a href="${baseUrl}/api/usuarios/login" class="endpoint">
                <span class="method POST">POST</span>/api/usuarios/login
              </a>
              <div class="description">Login de usuário</div>
            </div>

            <div class="card">
              <h3>🏪 Cantinas</h3>
              <a href="${baseUrl}/api/cantinas" class="endpoint">
                <span class="method GET">GET</span>/api/cantinas
              </a>
              <div class="description">Listar todas as cantinas</div>

              <a href="${baseUrl}/api/cantinas/1" class="endpoint">
                <span class="method GET">GET</span>/api/cantinas/:id
              </a>
              <div class="description">Buscar cantina por ID</div>

              <a href="${baseUrl}/api/cantinas/login" class="endpoint">
                <span class="method POST">POST</span>/api/cantinas/login
              </a>
              <div class="description">Login de cantina</div>
            </div>

            <div class="card">
              <h3>🍽️ Produtos</h3>
              <a href="${baseUrl}/api/produtos" class="endpoint">
                <span class="method GET">GET</span>/api/produtos
              </a>
              <div class="description">Listar todos os produtos</div>
            </div>
          </div>

          <div class="footer">
            <p><strong>Base URL:</strong> ${baseUrl}</p>
            <p><strong>Documentação:</strong> Clique nos endpoints acima para testar</p>
            <p><strong>Status:</strong> API funcionando perfeitamente! 🎉</p>
          </div>
        </div>
      </body>
    </html>
  `);
});

import produtoRoutes from "./routes/produtoRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import cantinaRoutes from "./routes/cantinaRoutes.js";

app.use("/api/produtos", produtoRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/cantinas", cantinaRoutes);

// Porta do servidor
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';
app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}`);
  console.log(`📖 Documentação: http://${HOST}:${PORT}/`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
