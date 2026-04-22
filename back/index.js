import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import healthRoutes from "./routes/health.js"
import usuariosRoutes from "./routes/usuarios.js"
import produtosRoutes from "./routes/produtos.js"

dotenv.config()

const app = express()

// Middlewares
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Rotas
app.use('/', healthRoutes)
app.use('/usuarios', usuariosRoutes)
app.use('/produtos', produtosRoutes)

// Tratamento de erros 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' })
})

// Iniciar servidor
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
})