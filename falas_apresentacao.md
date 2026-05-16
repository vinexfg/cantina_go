# Falas da Apresentação — CantinaGO

---

## ABERTURA

> "O CantinaGO é uma plataforma onde alunos fazem pedidos e a cantina gerencia tudo em tempo real. Mas o que quero destacar hoje não é só o que o sistema faz, e sim como ele foi construído. Em números: 175 testes unitários, zero vulnerabilidades nas dependências e nota de segurança 8,5 de 10."

---

## ARQUITETURA

> "Organizamos o código em camadas bem definidas — cada parte tem uma responsabilidade clara. As regras de negócio ficam separadas do banco de dados, o que torna o sistema fácil de manter e evoluir. Além disso, todo endpoint retorna sempre a mesma estrutura de resposta, então o frontend sabe exatamente o que esperar."

---

## TECNOLOGIAS

> "No backend usamos Node.js com PostgreSQL e autenticação via JWT. No frontend, React 19 com Vite. Para e-mails, integramos com a API do Brevo. O backend está no Render e o frontend no Vercel, com deploy automático pelo GitHub."

---

## SEGURANÇA

> "Essa é a parte que mais me orgulho. Quando o usuário troca a senha, todos os tokens antigos são invalidados imediatamente — o que não acontece na maioria dos sistemas. Senhas são armazenadas com bcrypt, o padrão do mercado. Temos proteção contra força bruta: após 5 tentativas erradas, a conta é bloqueada por 15 minutos — e esse bloqueio persiste mesmo se o servidor reiniciar. Nenhum segredo está no código, e não há risco de SQL injection porque nunca montamos queries com concatenação de strings."

---

## FRONTEND

> "O frontend protege as rotas por perfil — um aluno não consegue acessar o painel da cantina e vice-versa. Temos notificações em tempo real: quando a cantina atualiza um pedido, o aluno recebe na hora, sem precisar recarregar a página. As notificações ficam salvas mesmo se o usuário fechar o app."

---

## ENCERRAMENTO

> "Para fechar: zero vulnerabilidades, autenticação robusta, proteção em múltiplas camadas e 175 testes garantindo que as regras de negócio funcionam. O que faltaria para nota 10 seria um pentest externo com ferramentas como OWASP ZAP — o próximo passo natural se o sistema fosse para produção real. Para um projeto acadêmico, acreditamos que esse nível está acima da média — e foi exatamente o que buscamos. Obrigado."

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
