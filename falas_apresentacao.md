# Falas da Apresentação — CantinaGO

---

## ABERTURA (Hero)


>
> A ideia é simples: alunos conseguem fazer pedidos pela plataforma, e a cantina gerencia tudo em tempo real — produtos, pedidos, status, horário de funcionamento.
>
> Mas o que quero destacar hoje não é só o que o sistema faz, e sim **como ele foi construído** — as decisões técnicas, os padrões que seguimos e as boas práticas que aplicamos.
>
> Em números: o projeto tem **175 testes unitários**, **zero vulnerabilidades** nas dependências, e uma nota de segurança de **8,5 sobre 10**, que vou explicar como chegamos nesse número."

---

## ARQUITETURA

> "A primeira decisão importante foi a **arquitetura em camadas**, inspirada no padrão Clean Architecture.
>
> O fluxo de uma requisição começa nas **Routes**, que apenas definem as URLs e aplicam middlewares. Vai para os **Controllers**, que recebem a requisição e delegam para o **Service**. O Service contém toda a regra de negócio — validações, lógica de autorização, orquestração. E o **Repository** é a única camada que fala com o banco de dados.
>
> Isso significa que se um dia quisermos trocar o PostgreSQL por outro banco, só mudamos os Repositories — o resto do código não sabe nem que o banco existia.
>
> Além disso, usamos **Value Objects** — classes como `Email`, `Id` e `Produto` que encapsulam validação. Um e-mail inválido é rejeitado no momento em que se tenta criar o objeto, muito antes de chegar ao banco.
>
> E temos um padrão chamado **Result** — todo endpoint retorna a mesma estrutura JSON: sucesso, status, dados e mensagem. O frontend sabe exatamente o que esperar de qualquer rota."

---

## TECNOLOGIAS

> "No **backend**, usamos **Node.js com Express 5** — a versão mais recente, que já tem suporte nativo a async/await nos middlewares.
>
> O banco de dados é **PostgreSQL**, acessado via a biblioteca `pg` com queries parametrizadas — falo mais sobre isso na parte de segurança.
>
> Para autenticação, **JWT** — JSON Web Tokens — com uma camada extra que chamo de token versioning.
>
> Para segurança de senhas, **bcrypt** — que é o padrão do mercado para hash com salt.
>
> E para segurança geral da API, **Helmet** e **express-rate-limit**.
>
> Para e-mails — verificação de conta e notificação de pedidos — usamos a **API HTTP do Brevo**, que funciona mesmo em ambientes com portas SMTP bloqueadas como o Render.
>
> A documentação da API é gerada automaticamente pelo **Swagger / OpenAPI**.
>
> Os testes são escritos com **Vitest**.
>
> No **frontend**, **React 19** com **Vite 8** e **React Router v7** — tudo na versão mais atual disponível.
>
> O backend está hospedado no **Render** e o frontend no **Vercel** — ambos com deploy automático a partir do GitHub."

---

## SEGURANÇA

> "Agora a parte que mais me orgulho: segurança.
>
> O primeiro ponto é o **JWT com Token Versioning**. Normalmente quando você troca sua senha, o token antigo ainda funciona até expirar. Aqui não — cada usuário tem um número de versão no banco. Quando a senha muda, a versão incrementa e qualquer token antigo é rejeitado imediatamente.
>
> **Senhas** são armazenadas com bcrypt. Nunca em texto puro, nunca com MD5 ou SHA — bcrypt com salt automático, resistente a ataques de rainbow table.
>
> Para **força bruta**, temos rate limiting em duas camadas: global de 120 requisições por minuto para toda a API, e específico para login — 10 tentativas em 15 minutos. Além disso, após 5 tentativas erradas, a conta é bloqueada por 15 minutos, e esse estado fica salvo no banco de dados — então se o servidor reiniciar, o bloqueio continua.
>
> **SQL injection**: todas as queries usam parâmetros — nunca concatenamos strings para montar SQL. Isso é uma das vulnerabilidades mais comuns e mais fáceis de evitar.
>
> **Validação de propriedade**: uma cantina não consegue editar produtos de outra cantina. Verificamos se o `id` do usuário autenticado bate com o dono do recurso em toda operação de escrita.
>
> E os **segredos** — chave JWT, chave de API, senha do banco — nunca estão no código. São variáveis de ambiente, e o servidor nem sobe se a `JWT_SECRET` não estiver definida."

---

## FRONTEND

> "Agora o frontend, que também tem algumas decisões de arquitetura interessantes.
>
> É uma **SPA — Single Page Application** construída com React 19 e Vite. O usuário baixa o app uma vez e toda a navegação acontece sem recarregar a página.
>
> O primeiro ponto é a **proteção de rotas por perfil**. Temos dois tipos de usuário: aluno e cantina. Se um aluno tentar acessar o painel da cantina, é redirecionado automaticamente para o menu dele — e o contrário também. Isso é feito com componentes `RotaAluno` e `RotaVendedor` que envolvem as páginas protegidas.
>
> Usamos a **Context API do React** para gerenciar estado global, sem precisar de bibliotecas externas como Redux. Temos 5 contextos:
>
> O `NotificacoesContext` é o mais interessante — ele conecta ao **Server-Sent Events** do backend, recebe eventos em tempo real, toca um som de notificação e salva até 30 notificações no `localStorage`. Então mesmo que o usuário feche e reabra o app, as notificações ainda estão lá.
>
> O `ThemeContext` controla o modo claro e escuro, salvando a preferência do usuário entre sessões.
>
> O `ToastContext` exibe mensagens de feedback na tela sem bloquear a navegação — sabe aquele aviso que aparece no canto da tela e some sozinho? É isso.
>
> Temos também um `ErrorBoundary` — um componente que captura erros de renderização do React que normalmente causariam tela branca. Em vez disso, o usuário vê uma mensagem amigável com um botão para recarregar.
>
> No total são **12 páginas**, organizadas por quem pode acessar: páginas públicas, páginas de aluno e páginas de cantina."

---

## REST & OBJECT CALISTHENICS

> "O projeto segue dois paradigmas de design que valem mencionar.
>
> O primeiro é **REST**. Não é só usar HTTP — é usar corretamente. As URLs identificam recursos, não ações. Os métodos HTTP têm semântica: GET lê, POST cria, PUT atualiza, DELETE remove. E os status HTTP são precisos: 201 para criação, 401 quando não está autenticado, 403 quando não tem permissão, 404 quando não existe, 409 quando tem conflito. Nunca retornamos 200 para um erro.
>
> O segundo é **Object Calisthenics** — um conjunto de regras de disciplina de código. As principais que seguimos:
>
> Primeiro, **early return**: se há um erro ou validação que falha, lançamos uma exceção ou retornamos cedo. Sem blocos `else` aninhados que dificultam a leitura.
>
> Segundo, **primitivos encapsulados**: em vez de passar uma string de e-mail por todo o sistema, temos uma classe `Email` que valida o formato na criação. Se chegou até o banco, é porque é um e-mail válido.
>
> Terceiro, **nomes sem abreviações**: o código é lido muito mais do que escrito. Preferimos `validarCantinaAutenticada` a `valCantAuth` — qualquer pessoa que leia entende o que faz."

---

## ENDPOINTS

> "Aqui está um mapa das principais rotas da API.
>
> As rotas de **autenticação** — registro, login, verificação de e-mail, reset de senha — são públicas por necessidade.
>
> As rotas de **leitura** de produtos e cantinas também são públicas — qualquer pessoa pode ver o cardápio sem precisar fazer login, o que foi uma decisão de produto.
>
> Já as operações de **escrita** exigem JWT: criar produto, atualizar produto, deletar — e mais que isso, exigem que o usuário seja a cantina **dona** do recurso. O ícone de cadeado com 'dona' significa essa validação de propriedade que mencionei antes.
>
> As **reservas** são protegidas para usuários autenticados, e a atualização de status é restrita à cantina correspondente.
>
> O endpoint **SSE** — Server-Sent Events — é o canal de tempo real: quando a cantina atualiza o status de um pedido, o usuário recebe a notificação instantaneamente, sem precisar ficar recarregando a página."

---

## ENCERRAMENTO (Score)

> "Para fechar, chegamos na nota de segurança: **8,5 sobre 10**.
>
> Zero vulnerabilidades nas dependências — rodamos o `npm audit` regularmente.
>
> Implementamos autenticação robusta, proteção contra força bruta em múltiplas camadas, sem SQL injection, com headers de segurança e segredos isolados.
>
> O que faltaria para chegar a 10? Um pentest externo com ferramentas como OWASP ZAP ou Burp Suite, que testam a API de fora como um atacante real faria. Isso está fora do escopo de um projeto acadêmico, mas é o próximo passo natural se o sistema fosse para produção real.
>
> Para um projeto acadêmico, acreditamos que esse nível de segurança e qualidade de código está acima da média — e foi exatamente o que buscamos. Obrigado."

---

## RESPOSTAS PARA PERGUNTAS COMUNS

**"Por que usaram REST e não GraphQL?"**
> "REST é mais simples de implementar, de documentar com Swagger, e mais familiar para quem vai consumir a API. GraphQL faria sentido se tivéssemos muitas consultas com campos variáveis, o que não é o caso aqui."

**"Por que JWT e não sessões no servidor?"**
> "JWT é stateless — o servidor não precisa guardar sessões. Isso facilita escalar horizontalmente e é o padrão para APIs consumidas por aplicações frontend. A desvantagem de não poder invalidar tokens foi resolvida com o token versioning."

**"Como garantem que os testes cobrem o que importa?"**
> "Os testes mockam as dependências externas — banco, e-mail, JWT — e testam a lógica de negócio isolada. Isso garante que as regras de autorização, validação e fluxo de autenticação estão corretas independente de infraestrutura."

**"Por que Context API e não Redux ou Zustand?"**
> "Para o tamanho do projeto, Context API é suficiente e não adiciona dependência externa. Redux faria sentido em apps muito maiores com estado complexo compartilhado entre muitas partes. Aqui cada contexto tem uma responsabilidade clara e o estado não tem profundidade suficiente para justificar um gerenciador externo."

**"O que é Object Calisthenics na prática?"**
> "É uma disciplina de escrita de código com 9 regras. As mais visíveis aqui são: encapsular primitivos em Value Objects, evitar o `else` usando early return, e manter métodos e classes pequenos. O objetivo é forçar o código a ser mais legível e com responsabilidades bem definidas."
