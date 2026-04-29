# 🎓 Guia Prático: Como Usar o Novo Código

## 📖 Índice

1. [Como Criar um Novo Recurso](#como-criar-um-novo-recurso)
2. [Como Adicionar Validação](#como-adicionar-validação)
3. [Como Tratar Erros](#como-tratar-erros)
4. [Como Testar](#como-testar)
5. [Padrões e Convenções](#padrões-e-convenções)

---

## Como Criar um Novo Recurso

### Cenário: Criar recurso "Pedido"

### Passo 1: Criar o Value Object

**Arquivo:** `valueObjects/Pedido.js`

```javascript
import ValidationException from '../exceptions/ValidationException.js';
import Id from './Id.js';

class Pedido {
  constructor(id, descricao, status = 'pendente') {
    this.id = id instanceof Id ? id : new Id(id);
    this.descricao = descricao;
    this.status = status;
  }

  static fromRow(row) {
    return new Pedido(row.id, row.descricao, row.status);
  }

  static criar(dados) {
    Pedido.validarDados(dados);
    return new Pedido(dados.id || new Id(), dados.descricao, dados.status || 'pendente');
  }

  static validarDados(dados) {
    const erros = {};
    
    if (!dados.descricao || dados.descricao.trim() === '') {
      erros.descricao = 'Descrição é obrigatória';
    }
    
    if (dados.status && !['pendente', 'confirmado', 'entregue'].includes(dados.status)) {
      erros.status = 'Status inválido';
    }
    
    if (Object.keys(erros).length > 0) {
      throw new ValidationException('Dados de pedido inválidos', erros);
    }
  }

  estaConfirmado() {
    return this.status === 'confirmado';
  }

  confirmar() {
    this.status = 'confirmado';
  }

  entregar() {
    this.status = 'entregue';
  }

  toJSON() {
    return {
      id: this.id.toString(),
      descricao: this.descricao,
      status: this.status
    };
  }
}

export default Pedido;
```

### Passo 2: Criar o Repository

**Arquivo:** `repositories/PedidoRepository.js`

```javascript
import pool from '../db.js';

class PedidoRepository {
  static async findAll() {
    const query = 'SELECT * FROM pedidos';
    const { rows } = await pool.query(query);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM pedidos WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const { id, descricao, status } = data;
    const query = 'INSERT INTO pedidos (id, descricao, status) VALUES ($1, $2, $3) RETURNING *';
    const { rows } = await pool.query(query, [id, descricao, status]);
    return rows[0];
  }

  static async update(id, data) {
    const { descricao, status } = data;
    const query = 'UPDATE pedidos SET descricao = $1, status = $2 WHERE id = $3 RETURNING *';
    const result = await pool.query(query, [descricao, status, id]);
    return result.rowCount > 0;
  }

  static async delete(id) {
    const query = 'DELETE FROM pedidos WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
  }
}

export default PedidoRepository;
```

### Passo 3: Criar o Service

**Arquivo:** `services/PedidoService.js`

```javascript
import PedidoRepository from '../repositories/PedidoRepository.js';
import Pedido from '../valueObjects/Pedido.js';
import NotFoundException from '../exceptions/NotFoundException.js';

class PedidoService {
  async obterTodos() {
    const pedidos = await PedidoRepository.findAll();
    return pedidos.map(row => Pedido.fromRow(row).toJSON());
  }

  async obterPorId(id) {
    const pedido = await PedidoRepository.findById(id);
    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado');
    }
    return Pedido.fromRow(pedido).toJSON();
  }

  async criar(dados) {
    const pedido = Pedido.criar(dados);
    const pedidoCriado = await PedidoRepository.create({
      id: pedido.id.toString(),
      descricao: pedido.descricao,
      status: pedido.status
    });
    return Pedido.fromRow(pedidoCriado).toJSON();
  }

  async atualizar(id, dados) {
    await this.obterPorId(id);
    const pedido = Pedido.criar({ ...dados, id });
    
    await PedidoRepository.update(id, {
      descricao: pedido.descricao,
      status: pedido.status
    });
    
    return { success: true };
  }

  async remover(id) {
    await this.obterPorId(id);
    await PedidoRepository.delete(id);
  }
}

export default new PedidoService();
```

### Passo 4: Criar o Controller

**Arquivo:** `controllers/pedidoController.js`

```javascript
import PedidoService from '../services/PedidoService.js';
import Result from '../valueObjects/Result.js';
import ValidationException from '../exceptions/ValidationException.js';
import NotFoundException from '../exceptions/NotFoundException.js';

class PedidoController {
  static async obterTodos(req, res) {
    try {
      const pedidos = await PedidoService.obterTodos();
      Result.ok(pedidos).send(res);
    } catch (erro) {
      PedidoController.tratarErro(erro, res);
    }
  }

  static async obterPorId(req, res) {
    try {
      const { id } = req.params;
      const pedido = await PedidoService.obterPorId(id);
      Result.ok(pedido).send(res);
    } catch (erro) {
      PedidoController.tratarErro(erro, res);
    }
  }

  static async criar(req, res) {
    try {
      const pedidoCriado = await PedidoService.criar(req.body);
      Result.created(pedidoCriado, 'Pedido criado com sucesso').send(res);
    } catch (erro) {
      PedidoController.tratarErro(erro, res);
    }
  }

  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const atualizado = await PedidoService.atualizar(id, req.body);
      Result.ok(atualizado, 'Pedido atualizado com sucesso').send(res);
    } catch (erro) {
      PedidoController.tratarErro(erro, res);
    }
  }

  static async remover(req, res) {
    try {
      const { id } = req.params;
      await PedidoService.remover(id);
      Result.ok(null, 'Pedido removido com sucesso').send(res);
    } catch (erro) {
      PedidoController.tratarErro(erro, res);
    }
  }

  static tratarErro(erro, res) {
    if (erro instanceof ValidationException) {
      Result.badRequest(erro.message).send(res);
    } else if (erro instanceof NotFoundException) {
      Result.notFound(erro.message).send(res);
    } else {
      Result.internalError(erro.message).send(res);
    }
  }
}

export default PedidoController;
```

### Passo 5: Criar as Rotas

**Arquivo:** `routes/pedidoRoutes.js`

```javascript
import express from 'express';
import PedidoController from '../controllers/pedidoController.js';

const router = express.Router();

router.get('/', PedidoController.obterTodos);
router.get('/:id', PedidoController.obterPorId);
router.post('/', PedidoController.criar);
router.put('/:id', PedidoController.atualizar);
router.delete('/:id', PedidoController.remover);

export default router;
```

### Passo 6: Registrar as Rotas

**Arquivo:** `app.js`

```javascript
import pedidoRoutes from './routes/pedidoRoutes.js';

app.use('/api/pedidos', pedidoRoutes);
```

---

## Como Adicionar Validação

### Cenário: Adicionar campo "quantidade" ao Pedido

### Opção 1: Validação no Value Object

```javascript
static validarDados(dados) {
  const erros = {};
  
  if (!dados.descricao || dados.descricao.trim() === '') {
    erros.descricao = 'Descrição é obrigatória';
  }
  
  // Nova validação
  if (isNaN(parseInt(dados.quantidade)) || parseInt(dados.quantidade) <= 0) {
    erros.quantidade = 'Quantidade deve ser um número positivo';
  }
  
  if (Object.keys(erros).length > 0) {
    throw new ValidationException('Dados de pedido inválidos', erros);
  }
}
```

### Opção 2: Criar um novo Value Object

```javascript
class Quantidade {
  constructor(valor) {
    this.validate(valor);
    this.valor = parseInt(valor);
  }

  validate(valor) {
    if (isNaN(parseInt(valor)) || parseInt(valor) <= 0) {
      throw new ValidationException('Quantidade deve ser um número positivo');
    }
  }

  toString() {
    return this.valor.toString();
  }

  toJSON() {
    return this.valor;
  }
}

export default Quantidade;
```

Usar no Value Object:

```javascript
class Pedido {
  constructor(id, descricao, quantidade, status = 'pendente') {
    this.id = id instanceof Id ? id : new Id(id);
    this.descricao = descricao;
    this.quantidade = quantidade instanceof Quantidade ? quantidade : new Quantidade(quantidade);
    this.status = status;
  }
}
```

---

## Como Tratar Erros

### Padrão 1: Exceções Customizadas

```javascript
// Lançar
throw new ValidationException('Email inválido', { email: 'Email já existe' });

// Capturar no Controller
catch (erro) {
  if (erro instanceof ValidationException) {
    Result.badRequest(erro.message).send(res);
  }
}
```

### Padrão 2: Adicionar Novo Tipo de Erro

```javascript
// Arquivo: exceptions/UnauthorizedException.js
class UnauthorizedException extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnauthorizedException';
    this.statusCode = 401;
  }
}

export default UnauthorizedException;

// Usar no Controller
catch (erro) {
  if (erro instanceof UnauthorizedException) {
    Result.forbidden(erro.message).send(res);
  }
}
```

---

## Como Testar

### Teste do Value Object

```javascript
import { describe, it, expect } from '@jest/globals';
import Pedido from '../valueObjects/Pedido.js';
import ValidationException from '../exceptions/ValidationException.js';

describe('Pedido', () => {
  it('deve criar um pedido válido', () => {
    const dados = {
      descricao: 'Pedido de teste',
      status: 'pendente'
    };
    
    const pedido = Pedido.criar(dados);
    expect(pedido.descricao).toBe('Pedido de teste');
  });

  it('deve rejeitar descricao vazia', () => {
    const dados = {
      descricao: '',
      status: 'pendente'
    };
    
    expect(() => Pedido.criar(dados)).toThrow(ValidationException);
  });

  it('deve mudar status', () => {
    const pedido = new Pedido('id', 'teste', 'pendente');
    pedido.confirmar();
    expect(pedido.estaConfirmado()).toBe(true);
  });
});
```

### Teste do Service (Mock Repository)

```javascript
import PedidoService from '../services/PedidoService.js';
import PedidoRepository from '../repositories/PedidoRepository.js';

jest.mock('../repositories/PedidoRepository.js');

describe('PedidoService', () => {
  it('deve obter todos os pedidos', async () => {
    PedidoRepository.findAll.mockResolvedValue([
      { id: '123', descricao: 'Pedido 1', status: 'pendente' }
    ]);
    
    const pedidos = await PedidoService.obterTodos();
    expect(pedidos).toHaveLength(1);
  });

  it('deve lançar NotFoundException se não encontrado', async () => {
    PedidoRepository.findById.mockResolvedValue(null);
    
    await expect(PedidoService.obterPorId('999')).rejects.toThrow();
  });
});
```

---

## Padrões e Convenções

### Nomeação

| O quê | Padrão | Exemplo |
|-------|--------|---------|
| Classes | PascalCase | `Usuario`, `CantinaService` |
| Funções | camelCase | `obterPorId`, `validarDados` |
| Constantes | UPPER_SNAKE_CASE | `MAX_REQUESTS`, `DB_POOL_SIZE` |
| Arquivos | kebab-case ou PascalCase | `usuario-service.js` ou `UsuarioService.js` |
| Métodos privados | Com `#` | `#validarEmail()` |

### Estrutura de Arquivos

```
feature/
├── valueObjects/
│   └── Entidade.js        # Dados + Validação
├── repositories/
│   └── EntidadeRepository.js   # Acesso a dados
├── services/
│   └── EntidadeService.js      # Lógica
├── controllers/
│   └── entidadeController.js   # HTTP
└── routes/
    └── entidadeRoutes.js       # Rotas
```

### Fluxo de Dados

```
HTTP Request
    ↓
Router (apenas roteamento)
    ↓
Controller (apenas HTTP)
    ├── req.body → Service
    ├── Service → Value Object
    ├── Value Object → Validação
    ├── Service → Repository
    ├── Repository → Database
    ├── Database → Value Object
    └── Value Object → Result
    ↓
Result.ok/error().send(res)
    ↓
HTTP Response
```

### Checklist para Novo Recurso

- [ ] Value Object criado e validando
- [ ] Repository criado e acessando BD
- [ ] Service criado com lógica
- [ ] Controller criado com tratamento de erro
- [ ] Rotas criadas e registradas
- [ ] Testes escritos
- [ ] Documentação atualizada

---

## ⚡ Dicas Rápidas

### Debug
```javascript
// No Service
console.log('Debug:', { id, dados });
```

### Query Manual
```javascript
// Se precisar de query customizada
const query = 'SELECT * FROM pedidos WHERE status = $1 ORDER BY created_at DESC';
const { rows } = await pool.query(query, ['pendente']);
```

### Adicionar Campo
1. Adicionar no SQL (migration)
2. Adicionar no Repository
3. Adicionar no Value Object
4. Validar no Value Object
5. Adicionar no Service
6. Testar

### Remover Campo
1. Remover do SQL (migration)
2. Remover do Value Object
3. Remover do Repository
4. Remover do Service
5. Remover dos testes

---

## 🚀 Próximo Passo

Escolha um novo recurso e implemente seguindo este guia!

**Sugestões:**
- [ ] Pedidos
- [ ] Pagamentos
- [ ] Avaliações
- [ ] Promoções
- [ ] Categorias
