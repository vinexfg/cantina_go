import express from 'express';
import cors from 'cors';
import AppConfig from './config/AppConfig.js';
import LoggerMiddleware from './middleware/LoggerMiddleware.js';
import AuthMiddleware from './middleware/AuthMiddleware.js';
import ErrorMiddleware from './middleware/ErrorMiddleware.js';
import WelcomePage from './views/WelcomePage.js';
import authRoutes from './routes/authRoutes.js';
import produtoRoutes from './routes/produtoRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import cantinaRoutes from './routes/cantinaRoutes.js';
import reservaRoutes from './routes/reservaRoutes.js';

const config = new AppConfig();
const app = express();
const welcomePage = new WelcomePage(config);

app.use(cors(config.getCorsConfig()));
app.use(express.json(config.getExpressJsonConfig()));
app.use(express.urlencoded({ extended: true }));
app.use(LoggerMiddleware.createLogger());

// Rotas públicas
app.get(['/', '/api', '/api/bemvindo'], (req, res) => {
  res.send(welcomePage.render(req));
});
app.use('/api/auth', authRoutes);
app.use('/api/produtos', produtoRoutes);

// Rotas protegidas (exigem token JWT)
app.use('/api/usuarios', AuthMiddleware.verificar, usuarioRoutes);
app.use('/api/cantinas', AuthMiddleware.verificar, cantinaRoutes);
app.use('/api/reservas', AuthMiddleware.verificar, reservaRoutes);

// Tratamento centralizado de erros (deve ser o último middleware)
app.use(ErrorMiddleware.handle);

const serverInfo = config.getServerInfo();
app.listen(serverInfo.port, serverInfo.host, () => {
  console.log(`🚀 Servidor rodando em ${serverInfo.url}`);
  console.log(`📖 Documentação: ${serverInfo.url}/`);
  console.log(`🌍 Ambiente: ${serverInfo.environment}`);
});
