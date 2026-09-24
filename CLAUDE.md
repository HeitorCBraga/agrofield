# AgroField

Contexto do projeto
AgroField é uma plataforma web modular para produtores rurais. O objetivo principal do desenvolvedor (Heitor) é aprender o fluxo completo de DevOps (Docker, CI/CD, APM), usando o desenvolvimento da aplicação como veículo. O código da aplicação é gerado com assistência — as partes de infraestrutura e DevOps são o foco de aprendizado real.
Como gerar código
• Gere código funcional e limpo, seguindo padrões do ecossistema Node.js/TypeScript
• Use TypeScript em todo o projeto (backend e frontend)
• Siga o padrão REST para as rotas da API
• Use Prisma como ORM — sempre gere migrations para mudanças no schema
• Quando criar arquivos DevOps (Dockerfile, docker-compose.yml, ci.yml), explique cada linha em detalhe — o desenvolvedor precisa entender profundamente essas partes
• Para código de aplicação (rotas, componentes React, services), explique o fluxo geral ("essa rota recebe X, consulta Y, retorna Z") sem detalhar cada linha de sintaxe
• Nunca gere código sem explicar o que ele faz e por que, pelo menos no nível de fluxo
Stack definido
• Backend: Node.js + Fastify + TypeScript
• Frontend: Next.js (React) + TypeScript
• Banco: PostgreSQL via Prisma
• Cache: Redis
• Auth: JWT (email/senha com bcrypt)
• Testes: Vitest
• Containers: Docker + docker-compose
• CI/CD: GitHub Actions → Docker Hub
• APM: Datadog (fase 2)
Ordem de construção
1. Esqueleto do repo (estrutura de pastas, package.json, tsconfig)
2. docker-compose.yml (postgres + redis + backend + frontend)
3. Dockerfile do backend (multi-stage build) — EXPLICAR CADA LINHA
4. Dockerfile do frontend (multi-stage build) — EXPLICAR CADA LINHA
5. Prisma schema + migration inicial (User, Property)
6. Auth (register, login, JWT middleware)
7. CRUD de Property
8. CRUD de Plot (Talhão)
9. CRUD de Crop, InputApplication, Harvest
10. Frontend: telas de login, dashboard, CRUD
11. GitHub Actions pipeline (ci.yml) — EXPLICAR CADA STEP
12. Testes com Vitest
13. Datadog APM (fase 2) — EXPLICAR INSTRUMENTAÇÃO EM DETALHE
Regras importantes
• Nunca pular explicação de arquivos DevOps (Dockerfile, docker-compose, GitHub Actions, Datadog config)
• Código de aplicação pode ser explicado por alto (fluxo), não precisa detalhar sintaxe
• Sempre commitar com mensagens descritivas em inglês (ex: "feat: add property CRUD routes")
• Um feature por commit — não juntar várias mudanças
• Não instalar dependências sem explicar o que fazem
• Se o desenvolvedor perguntar "explica isso", explicar em profundidade independente do tipo de arquivo
Hands-off DevOps — o desenvolvedor faz
O Claude Code nunca deve executar por conta própria nenhuma ação de DevOps. Ele deve apenas instruir e explicar. O desenvolvedor executa manualmente:
• Todos os comandos git (git add, git commit, git push, git branch, git merge)
• Criação e edição de Dockerfile e docker-compose.yml (Claude Code mostra o conteúdo e explica, o dev cria o arquivo)
• Escrita do workflow do GitHub Actions (ci.yml)
• Comandos Docker (docker build, docker compose up, docker push)
• Configuração do Datadog Agent e instrumentação
• Qualquer configuração de infraestrutura (AWS, registry, secrets)
O Claude Code pode gerar e criar diretamente apenas código de aplicação (rotas, componentes, services, migrations). Para todo o resto que seja DevOps/infra, ele explica o que fazer e por que, e o desenvolvedor executa.