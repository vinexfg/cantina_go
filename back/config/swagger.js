const spec = {
  openapi: '3.0.0',
  info: {
    title: 'CantinaGO API',
    version: '1.0.0',
    description: 'API REST do sistema de reservas da cantina escolar',
  },
  servers: [
    { url: process.env.SERVER_URL || 'https://cantina-go-415n.onrender.com', description: 'Produção' },
    { url: 'http://localhost:3000', description: 'Local' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtido no login',
      },
    },
    schemas: {
      Erro: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Descrição do erro' },
          fields: {
            type: 'object',
            description: 'Erros por campo (apenas em 400)',
            example: { email: 'Email inválido', senha: 'Senha obrigatória' },
          },
        },
      },
    },
  },
  paths: {
    '/api/auth/registro/usuario': {
      post: {
        tags: ['Autenticação'],
        summary: 'Cadastrar aluno',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nome', 'email', 'senha'],
                properties: {
                  nome: { type: 'string', example: 'João Silva' },
                  email: { type: 'string', example: 'joao@escola.br' },
                  senha: { type: 'string', example: 'Senha123' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Usuário criado com sucesso' },
          400: { description: 'Dados inválidos', content: { 'application/json': { schema: { $ref: '#/components/schemas/Erro' } } } },
          409: { description: 'Email já cadastrado' },
        },
      },
    },
    '/api/auth/registro/cantina': {
      post: {
        tags: ['Autenticação'],
        summary: 'Cadastrar cantina (requer chave administrativa)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nome', 'email', 'senha', 'chaveAdmin'],
                properties: {
                  nome: { type: 'string', example: 'Cantina Central' },
                  email: { type: 'string', example: 'cantina@escola.br' },
                  senha: { type: 'string', example: 'Senha123' },
                  chaveAdmin: { type: 'string', example: '••••••••', description: 'Chave administrativa necessária para criar uma cantina' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Cantina criada com sucesso' },
          400: { description: 'Dados inválidos' },
          403: { description: 'Chave administrativa inválida' },
          409: { description: 'Email já cadastrado' },
        },
      },
    },
    '/api/auth/login/usuario': {
      post: {
        tags: ['Autenticação'],
        summary: 'Login do aluno',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'senha'],
                properties: {
                  email: { type: 'string', example: 'joao@escola.br' },
                  senha: { type: 'string', example: 'Senha123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login realizado — retorna token JWT e dados do usuário' },
          401: { description: 'Credenciais inválidas ou conta bloqueada' },
        },
      },
    },
    '/api/auth/login/cantina': {
      post: {
        tags: ['Autenticação'],
        summary: 'Login da cantina',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'senha'],
                properties: {
                  email: { type: 'string', example: 'cantina@escola.br' },
                  senha: { type: 'string', example: 'Senha123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login realizado — retorna token JWT e dados da cantina' },
          401: { description: 'Credenciais inválidas' },
        },
      },
    },
    '/api/auth/esqueci-senha': {
      post: {
        tags: ['Autenticação'],
        summary: 'Solicitar reset de senha',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string', example: 'joao@escola.br' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Email de reset enviado (se o email existir)' },
        },
      },
    },
    '/api/auth/resetar-senha': {
      post: {
        tags: ['Autenticação'],
        summary: 'Redefinir senha com token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'novaSenha'],
                properties: {
                  token: { type: 'string' },
                  novaSenha: { type: 'string', example: 'NovaSenha123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Senha redefinida com sucesso' },
          400: { description: 'Token inválido ou expirado' },
        },
      },
    },
    '/api/auth/verificar-email': {
      get: {
        tags: ['Autenticação'],
        summary: 'Verificar email via token',
        parameters: [{ in: 'query', name: 'token', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Email verificado com sucesso' },
          400: { description: 'Token inválido ou expirado' },
        },
      },
    },
    '/api/auth/conta': {
      delete: {
        tags: ['Autenticação'],
        summary: 'Excluir conta do usuário autenticado',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['senha'],
                properties: { senha: { type: 'string' } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Conta excluída' },
          401: { description: 'Senha incorreta' },
        },
      },
    },
    '/api/cantinas': {
      get: {
        tags: ['Cantinas'],
        summary: 'Listar cantinas (público)',
        description: 'Retorna id e nome de todas as cantinas. Usado no dropdown do login.',
        responses: {
          200: {
            description: 'Lista de cantinas',
            content: {
              'application/json': {
                example: { data: [{ id: 'uuid', nome: 'Cantina Central' }] },
              },
            },
          },
        },
      },
    },
    '/api/cantinas/{id}': {
      get: {
        tags: ['Cantinas'],
        summary: 'Buscar cantina por ID (público)',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Dados da cantina' },
          404: { description: 'Cantina não encontrada' },
        },
      },
      put: {
        tags: ['Cantinas'],
        summary: 'Atualizar cantina (somente a própria cantina)',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nome: { type: 'string' },
                  email: { type: 'string' },
                  senha: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Cantina atualizada' },
          403: { description: 'Acesso negado' },
        },
      },
      delete: {
        tags: ['Cantinas'],
        summary: 'Remover cantina (somente a própria cantina)',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Cantina removida' },
          403: { description: 'Acesso negado' },
        },
      },
    },
    '/api/produtos/disponiveis': {
      get: {
        tags: ['Produtos'],
        summary: 'Listar produtos disponíveis (público)',
        parameters: [
          { in: 'query', name: 'cantina_id', schema: { type: 'string', format: 'uuid' } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
        ],
        responses: { 200: { description: 'Lista paginada de produtos disponíveis' } },
      },
    },
    '/api/produtos/cantina/{cantina_id}': {
      get: {
        tags: ['Produtos'],
        summary: 'Listar todos os produtos de uma cantina (requer auth de cantina)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'cantina_id', required: true, schema: { type: 'string', format: 'uuid' } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
        ],
        responses: { 200: { description: 'Lista paginada com arquivados incluídos' } },
      },
    },
    '/api/produtos': {
      post: {
        tags: ['Produtos'],
        summary: 'Criar produto (somente cantina)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nome', 'preco'],
                properties: {
                  nome: { type: 'string', example: 'Coxinha' },
                  descricao: { type: 'string', example: 'Coxinha de frango' },
                  preco: { type: 'number', example: 5.5 },
                  disponivel: { type: 'boolean', default: true },
                  quantidade_limite: { type: 'integer', example: 50 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Produto criado' },
          403: { description: 'Acesso negado' },
        },
      },
    },
    '/api/produtos/{id}': {
      put: {
        tags: ['Produtos'],
        summary: 'Atualizar produto (somente cantina dona)',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Produto atualizado' }, 403: { description: 'Acesso negado' } },
      },
      delete: {
        tags: ['Produtos'],
        summary: 'Arquivar produto (soft delete)',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Produto arquivado' }, 403: { description: 'Acesso negado' } },
      },
    },
    '/api/reservas': {
      post: {
        tags: ['Reservas'],
        summary: 'Criar reserva (somente aluno)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['cantina_id', 'usuario_id', 'itens'],
                properties: {
                  cantina_id: { type: 'string', format: 'uuid' },
                  usuario_id: { type: 'string', format: 'uuid' },
                  itens: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        produto_id: { type: 'string', format: 'uuid' },
                        quantidade: { type: 'integer', example: 2 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Reserva criada' },
          400: { description: 'Dados inválidos' },
        },
      },
    },
    '/api/reservas/{id}': {
      get: {
        tags: ['Reservas'],
        summary: 'Buscar reserva por ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Dados da reserva com itens' }, 404: { description: 'Não encontrada' } },
      },
      delete: {
        tags: ['Reservas'],
        summary: 'Cancelar/remover reserva',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Reserva removida' }, 403: { description: 'Acesso negado' } },
      },
    },
    '/api/reservas/{id}/status': {
      patch: {
        tags: ['Reservas'],
        summary: 'Atualizar status da reserva (somente cantina)',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['pendente', 'confirmada', 'cancelada', 'concluida'] },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Status atualizado' }, 403: { description: 'Acesso negado' } },
      },
    },
    '/api/reservas/cantina/{cantina_id}': {
      get: {
        tags: ['Reservas'],
        summary: 'Listar reservas de uma cantina',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'cantina_id', required: true, schema: { type: 'string', format: 'uuid' } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
        ],
        responses: { 200: { description: 'Lista paginada de reservas' } },
      },
    },
    '/api/reservas/cantina/{cantina_id}/historico': {
      get: {
        tags: ['Reservas'],
        summary: 'Histórico de reservas concluídas (últimos 7 dias)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'cantina_id', required: true, schema: { type: 'string', format: 'uuid' } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
        ],
        responses: { 200: { description: 'Histórico paginado' } },
      },
    },
    '/api/reservas/usuario/{usuario_id}': {
      get: {
        tags: ['Reservas'],
        summary: 'Listar reservas de um aluno',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'usuario_id', required: true, schema: { type: 'string', format: 'uuid' } },
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 20 } },
        ],
        responses: { 200: { description: 'Lista paginada de reservas do aluno' } },
      },
    },
    '/api/reservas/antigas/limpar': {
      post: {
        tags: ['Reservas'],
        summary: 'Remover reservas concluídas com mais de 7 dias (somente cantina)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Reservas antigas removidas' } },
      },
    },
    '/api/reservas/usuario/{usuario_id}/antigas/limpar': {
      post: {
        tags: ['Reservas'],
        summary: 'Remover reservas antigas de um aluno',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'usuario_id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Reservas antigas do aluno removidas' } },
      },
    },
    '/api/usuarios/{id}': {
      get: {
        tags: ['Usuários'],
        summary: 'Buscar perfil do usuário (somente o próprio usuário)',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: 'Dados do usuário' },
          403: { description: 'Acesso negado — somente o próprio usuário pode ver seu perfil' },
        },
      },
      put: {
        tags: ['Usuários'],
        summary: 'Atualizar perfil (somente o próprio usuário)',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['senha_atual'],
                properties: {
                  nome: { type: 'string' },
                  email: { type: 'string' },
                  senha: { type: 'string' },
                  senha_atual: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Perfil atualizado' }, 403: { description: 'Acesso negado ou senha incorreta' } },
      },
      delete: {
        tags: ['Usuários'],
        summary: 'Remover conta (somente o próprio usuário)',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: { 200: { description: 'Usuário removido' }, 403: { description: 'Acesso negado' } },
      },
    },
  },
};

export default spec;
