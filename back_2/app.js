import express from "express";
const app = express();

// Middleware para parsing JSON
app.use(express.json());

// Importar rotas
import produtoRoutes from "./routes/produtoRoutes.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import cantinaRoutes from "./routes/cantinaRoutes.js";

app.use("/api/produtos", produtoRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/cantinas", cantinaRoutes);

// Porta do servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
