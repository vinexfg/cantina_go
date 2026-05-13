import express from 'express';
const router = express.Router();
import AuthMiddleware from '../middleware/AuthMiddleware.js';
import SseManager from '../sse/SseManager.js';

router.get('/', AuthMiddleware.verificarSSE, (req, res) => {
  const { id, tipo } = req.usuario;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  res.write('event: conectado\ndata: {}\n\n');
  SseManager.add(tipo, id, res);

  const heartbeat = setInterval(() => {
    try { res.write(': heartbeat\n\n'); } catch { clearInterval(heartbeat); }
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    SseManager.remove(tipo, id, res);
  });
});

export default router;
