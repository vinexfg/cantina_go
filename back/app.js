import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import AppConfig from './config/AppConfig.js';
import LoggerMiddleware from './middleware/LoggerMiddleware.js';
import AuthMiddleware from './middleware/AuthMiddleware.js';
import ErrorMiddleware from './middleware/ErrorMiddleware.js';
import { apiLimiter } from './middleware/RateLimitMiddleware.js';
import WelcomePage from './views/WelcomePage.js';
import CantinaController from './controllers/cantinaController.js';
import authRoutes from './routes/authRoutes.js';
import produtoRoutes from './routes/produtoRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import cantinaRoutes from './routes/cantinaRoutes.js';
import reservaRoutes from './routes/reservaRoutes.js';
import { migrate } from './migrations.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

if (!process.env.JWT_SECRET) {
  console.error('ERRO FATAL: JWT_SECRET não definido. Defina a variável de ambiente antes de iniciar.');
  process.exit(1);
}

const config = new AppConfig();
const app = express();
const welcomePage = new WelcomePage(config);

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-origin' } }));
app.use(express.static(join(__dirname, 'public')));
app.use(cors(config.getCorsConfig()));
app.use(express.json(config.getExpressJsonConfig()));
app.use(express.urlencoded({ extended: true }));
app.use(LoggerMiddleware.createLogger());
app.use('/api', apiLimiter);

// Documentação Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas públicas
app.get(['/', '/api', '/api/bemvindo'], (req, res) => {
  res.send(welcomePage.render(req));
});
app.use('/api/auth', authRoutes);
app.use('/api/produtos', produtoRoutes);
app.get('/api/cantinas', CantinaController.listar);

// Rotas protegidas (exigem token JWT)
app.use('/api/usuarios', AuthMiddleware.verificar, usuarioRoutes);
app.use('/api/cantinas', AuthMiddleware.verificar, cantinaRoutes);
app.use('/api/reservas', AuthMiddleware.verificar, reservaRoutes);

// Tratamento centralizado de erros (deve ser o último middleware)
app.use(ErrorMiddleware.handle);

const serverInfo = config.getServerInfo();

try {
  await migrate();

  app.listen(serverInfo.port, serverInfo.host, () => {
    console.log(`🚀 Servidor rodando em ${serverInfo.url}`);
    console.log(`📖 Documentação: ${serverInfo.url}/`);
    console.log(`🌍 Ambiente: ${serverInfo.environment}`);
  });
} catch (err) {
  console.error('Erro na migração do banco:', err);
  process.exit(1);
}
