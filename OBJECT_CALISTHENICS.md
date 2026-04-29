# Object Calisthenics - Refatoração Completa do Projeto

## 📋 Resumo das 10 Regras Aplicadas

Este documento descreve como as 10 regras de Object Calisthenics foram aplicadas ao projeto Cantina GO.

---

## 🎯 As 10 Regras de Object Calisthenics

### ✅ Rule 1: Use apenas um nível de indentação por método
**Aplicação:** 
- Controllers refatorados para usar métodos helper `tratarErro()`
- Services com métodos simples que delegam responsabilidades
- Cada método tem responsabilidade única e clara

**Arquivos:** `controllers/`, `services/`

---

### ✅ Rule 2: Não use a palavra-chave `else`
**Aplicação:**
- Controllers usam `Result.ok()`, `Result.notFound()`, `Result.badRequest()`
- Services lançam exceções específicas ao invés de usar `else`
- Result retorna sucesso ou falha sem condicionais

**Arquivos:** `valueObjects/Result.js`, `exceptions/`

---

### ✅ Rule 3: Encapsule todas as primitivas e strings em Value Objects
**Aplicação:**
- `Id.js` - Encapsula UUIDs com validação
- `Email.js` - Encapsula emails com validação
- `Preco.js` - Encapsula valores monetários
- Value Objects dentro de `Cantina.js`, `Usuario.js`, `Produto.js`

**Arquivos:** `valueObjects/`

---

### ✅ Rule 4: Use apenas um ponto por linha
**Aplicação:**
- QueryBuilder quebrado em métodos encadeáveis: `.select().from().where()`
- Cada operação retorna `this` para encadeamento
- Sem acesso a objetos aninhados

**Arquivos:** `utils/QueryBuilder.js`

---

### ✅ Rule 5: Não abrevie variáveis
**Aplicação:**
- Removidos logs desnecessários de `UsuarioModel.js`
- Variáveis com nomes descritivos: `cantinaCriada`, `usuarioCriado`
- Comentários removidos, código auto-documentável

**Arquivos:** Todos

---

### ✅ Rule 6: Mantenha as entidades pequenas
**Aplicação:**
- Controllers: Apenas 6 métodos CRUD + tratamento de erros
- Services: Lógica de negócio isolada
- Repositories: Apenas acesso a dados
- Value Objects: Validação e encapsulamento

**Arquivos:** 
- `controllers/` - ~70 linhas cada
- `services/` - ~50 linhas cada
- `repositories/` - ~50 linhas cada

---

### ✅ Rule 7: Nenhum accessor direto; use métodos
**Aplicação:**
- `Id.toString()`, `Email.toString()`, `Preco.toJSON()`
- `Produto.estaDisponivel()`, `Produto.marcarIndisponivel()`
- Acesso aos dados via métodos, não properties diretas

**Arquivos:** `valueObjects/`

---

### ✅ Rule 8: Use composição ao invés de herança
**Aplicação:**
- `Result` contém `data` e `message` sem herança
- `AppConfig` composto de configurações simples
- `WelcomePage` recebe `AppConfig` como composição

**Arquivos:** `valueObjects/Result.js`, `config/AppConfig.js`, `views/WelcomePage.js`

---

### ✅ Rule 9: Não selecione; peça ações ("Tell don't Ask")
**Aplicação:**
- Controllers chamam `CantinaService.obterPorId()` e lançam exceção se não encontrado
- Services validam e transformam dados
- Repositories executam comandos sem retornar booleanos

**Arquivos:** `services/`, `repositories/`

---

### ✅ Rule 10: Não use if para validações; use exceções
**Aplicação:**
- `ValidationException` para dados inválidos
- `NotFoundException` para recursos não encontrados
- `ConflictException` para conflitos de negócio
- Controllers tratam todas as exceções num único ponto

**Arquivos:** `exceptions/`, `controllers/`

---

## 📁 Nova Estrutura do Projeto

```
back/
├── config/
│   └── AppConfig.js              # Configurações centralizadas
├── middleware/
│   └── LoggerMiddleware.js        # Middleware de logging
├── views/
│   └── WelcomePage.js             # Página de boas-vindas
├── valueObjects/
│   ├── Id.js                      # Value Object para IDs (Rule 1,3,6)
│   ├── Email.js                   # Value Object para Emails (Rule 1,3,6)
│   ├── Produto.js                 # Value Object Produto (Rule 1,3,6)
│   ├── Cantina.js                 # Value Object Cantina (Rule 1,3,6)
│   ├── Usuario.js                 # Value Object Usuario (Rule 1,3,6)
│   └── Result.js                  # Value Object para Respostas (Rule 2,10)
├── exceptions/
│   ├── ValidationException.js     # Exceção de validação (Rule 10)
│   ├── NotFoundException.js        # Exceção não encontrado (Rule 10)
│   └── ConflictException.js        # Exceção de conflito (Rule 10)
├── utils/
│   └── QueryBuilder.js            # Query builder encadeável (Rule 4,5)
├── repositories/
│   ├── Repository.js              # Classe base (Rule 7,9)
│   ├── CantinaRepository.js        # Dados de Cantina (Rule 7,9)
│   ├── ProdutoRepository.js        # Dados de Produto (Rule 7,9)
│   └── UsuarioRepository.js        # Dados de Usuario (Rule 7,9)
├── services/
│   ├── CantinaService.js           # Lógica Cantina (Rule 1,3,9)
│   ├── ProdutoService.js           # Lógica Produto (Rule 1,3,9)
│   └── UsuarioService.js           # Lógica Usuario (Rule 1,3,9)
├── controllers/
│   ├── cantinaController.js        # API Cantina (Rule 1,2,10)
│   ├── produtoController.js        # API Produto (Rule 1,2,10)
│   └── usuarioController.js        # API Usuario (Rule 1,2,10)
├── routes/
│   ├── cantinaRoutes.js            # Rotas de Cantina
│   ├── produtoRoutes.js            # Rotas de Produto
│   └── usuarioRoutes.js            # Rotas de Usuario
├── models/ (deprecated)
│   ├── cantinaModel.js
│   ├── produtoModel.js
│   └── usuarioModel.js
├── app.js                          # Aplicação refatorada (Rule 1,4,5)
└── db.js                           # Conexão com banco
```

---

## 🔄 Fluxo de Requisição Refatorado

```
HTTP Request
    ↓
Router → Controller
    ↓
Controller.tratarErro() ← Service
    ├→ Service.validar() (ValidationException)
    ├→ Service.obterDados() (NotFoundException)
    └→ Service.executarLogica()
        ↓
    Repository (QueryBuilder)
        ↓
    Database
        ↓
    Mapper para Value Object
        ↓
    Result.ok() / Result.error()
        ↓
HTTP Response (JSON)
```

---

## 💡 Benefícios da Refatoração

### 1. **Responsabilidade Única**
- Controllers: Apenas HTTP
- Services: Apenas lógica
- Repositories: Apenas dados

### 2. **Sem Duplicação**
- `tratarErro()` centralizado
- Validações em Value Objects
- Queries em Repositories

### 3. **Testabilidade**
- Services podem ser testados sem HTTP
- Repositories podem ser mockados
- Value Objects testáveis isoladamente

### 4. **Manutenibilidade**
- Código auto-documentável
- Sem valores mágicos
- Composição clara

### 5. **Segurança**
- Validações obrigatórias
- Tipos encapsulados
- Acesso controlado

---

## 🚀 Próximos Passos Recomendados

1. **Testes Unitários**
   ```javascript
   // Para Services
   describe('CantinaService', () => {
     it('deve validar email', async () => { ... });
   });
   
   // Para Value Objects
   describe('Email', () => {
     it('deve rejeitar email inválido', () => { ... });
   });
   ```

2. **Middleware de Erro Global**
   ```javascript
   app.use((err, req, res, next) => {
     const result = Result[err.statusCode === 404 ? 'notFound' : 'internalError'](err.message);
     result.send(res);
   });
   ```

3. **Logging Estruturado**
   ```javascript
   // Usar winston ou pino para logs em JSON
   logger.info('Cantina criada', { id: cantina.id.toString() });
   ```

4. **Documentação OpenAPI**
   ```javascript
   // Integrar Swagger UI
   import swaggerUi from 'swagger-ui-express';
   app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));
   ```

---

## 📝 Notas Importantes

- Os arquivos em `models/` ainda existem por compatibilidade, mas não são usados
- Services e Repositories são singletons (instância única)
- Value Objects são imutáveis por convenção
- Todas as exceções têm `statusCode` para mapeamento HTTP

---

## ✨ Conclusão

O projeto agora segue as 10 regras de Object Calisthenics, resultando em:
- ✅ Código mais limpo e legível
- ✅ Melhor separação de responsabilidades
- ✅ Mais fácil de testar
- ✅ Melhor manutenibilidade
- ✅ Melhor escalabilidade
