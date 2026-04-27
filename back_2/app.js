import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Middleware CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging básico
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Página de boas-vindas para confirmar que a API está rodando
app.get(["/", "/bemvindo"], (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>API Cantina SENAC</title>
        <style>
          body { margin: 0; font-family: Arial, sans-serif; background: #eef3fb; color: #1f2937; }
          .page { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
          .card { max-width: 720px; width: 100%; background: #ffffff; border-radius: 18px; box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08); padding: 40px; }
          h1 { margin-top: 0; color: #2563eb; }
          p { line-height: 1.75; font-size: 1rem; }
          code { background: #f3f4f6; color: #111827; padding: 4px 8px; border-radius: 6px; }
          .footer { margin-top: 24px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="card">
            <h1>Bem-vindo à API Cantina SENAC</h1>
            <p>A API está funcionando corretamente no backend.</p>
            <p>Use estas rotas para testar:</p>
            <ul>
              <li><code>/api/usuarios</code></li>
              <li><code>/api/cantinas</code></li>
              <li><code>/api/produtos</code></li>
            </ul>
            <p>Rotas de login:</p>
            <ul>
              <li><code>/api/usuarios/login</code></li>
              <li><code>/api/cantinas/login</code></li>
            </ul>
            <p class="footer">Se você vê esta página, o servidor está ativo em <strong>http://localhost:3000</strong>.</p>
          </div>
        </div>
      </body>
    </html>
  `);
});

// Importar rotas
import produtoRoutes from "./routes/produtoRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import cantinaRoutes from "./routes/cantinaRoutes.js";

// Importar middlewares
import { authenticateToken } from "./middleware/auth.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

// Rotas públicas (não precisam de autenticação)
app.use("/api/produtos", produtoRoutes);

// Rotas de autenticação (públicas)
app.use("/api/usuarios", usuarioRoutes); // Inclui login de usuários
app.use("/api/cantinas", cantinaRoutes); // Inclui login de cantinas

// Middleware de autenticação para rotas protegidas
// Exemplo: app.use("/api/admin", authenticateToken, adminRoutes);

// Middleware para rotas não encontradas
app.use(notFoundHandler);

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

// Porta do servidor
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';
app.listen(PORT, HOST, () => {
  console.log(`Servidor rodando em http://${HOST}:${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
