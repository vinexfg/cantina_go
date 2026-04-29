import express from 'express';
import cors from 'cors';
import AppConfig from './config/AppConfig.js';
import LoggerMiddleware from './middleware/LoggerMiddleware.js';
import WelcomePage from './views/WelcomePage.js';
import produtoRoutes from './routes/produtoRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import cantinaRoutes from './routes/cantinaRoutes.js';

const config = new AppConfig();
const app = express();
const welcomePage = new WelcomePage(config);

app.use(cors(config.getCorsConfig()));
app.use(express.json(config.getExpressJsonConfig()));
app.use(express.urlencoded({ extended: true }));
app.use(LoggerMiddleware.createLogger());

app.get(['/api', '/api/bemvindo'], (req, res) => {
  res.send(welcomePage.render(req));
});

app.use('/api/produtos', produtoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/cantinas', cantinaRoutes);

const serverInfo = config.getServerInfo();
app.listen(serverInfo.port, serverInfo.host, () => {
  console.log(`🚀 Servidor rodando em ${serverInfo.url}`);
  console.log(`📖 Documentação: ${serverInfo.url}/`);
  console.log(`🌍 Ambiente: ${serverInfo.environment}`);
});
