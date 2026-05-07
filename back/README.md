# Cantina GO - Backend API

API REST completa para gerenciamento de cantinas com autenticação JWT.

## 🚀 Como executar

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn

### Instalação e execução

```bash
# Entrar no diretório do backend
cd back

# Instalar dependências
npm install

# Executar em modo desenvolvimento (com hot reload)
npm run dev

# Ou executar normalmente
npm start
```

O servidor estará rodando em: **http://localhost:3000**

## 📖 Documentação da API

Acesse **http://localhost:3000/** no navegador para ver a documentação interativa com todos os endpoints disponíveis.

### Endpoints principais

#### 👥 Usuários
- `GET /api/usuarios` - Listar todos os usuários
- `GET /api/usuarios/:id` - Buscar usuário por ID
- `POST /api/usuarios/login` - Login de usuário

#### 🏪 Cantinas
- `GET /api/cantinas` - Listar todas as cantinas
- `GET /api/cantinas/:id` - Buscar cantina por ID
- `POST /api/cantinas/login` - Login de cantina

#### 🍽️ Produtos
- `GET /api/produtos` - Listar todos os produtos

## 🔐 Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Faça login nas rotas `/api/usuarios/login` ou `/api/cantinas/login` para obter um token.

## 🛠️ Tecnologias utilizadas

- **Express.js** - Framework web
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **CORS** - Controle de acesso cross-origin
- **PostgreSQL** - Banco de dados

## 📝 Scripts disponíveis

- `npm start` - Inicia o servidor
- `npm run dev` - Inicia o servidor em modo desenvolvimento com hot reload
- `npm test` - Executa testes

## 🌐 Ambiente

- **Desenvolvimento**: `http://localhost:3000`
- **Produção**: Configurar variável `PORT` no ambiente

### Variáveis de ambiente

Para rodar localmente, copie `.env.example` para `.env` dentro da pasta `back/` e ajuste a senha do PostgreSQL.

No Render, configure pelo painel do serviço:

```env
NODE_ENV=production
HOST=0.0.0.0
PORT=10000
DATABASE_URL=sua_internal_database_url_do_render
CORS_ORIGIN=https://cantina-senac-projeto.vercel.app
JWT_SECRET=um_segredo_forte
JWT_EXPIRES_IN=8h
GOOGLE_CLIENT_ID=
HISTORICO_DIAS=7
```

Se `DATABASE_URL` estiver definida, o backend usa ela automaticamente e ignora `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_NAME`.

No front publicado na Vercel, configure:

```env
VITE_API_URL=https://cantina-go.onrender.com/api
```

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação em `http://localhost:3000/` após iniciar o servidor.
