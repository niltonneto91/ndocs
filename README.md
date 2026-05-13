# NDOCS

NDOCS e um MVP SaaS para gestao documental, projetos, ativos e conformidade regulatoria de terminais de combustiveis. O produto centraliza documentos tecnicos e regulatorios, controla versoes, acompanha vencimentos e organiza dossies para auditorias, fiscalizacoes e processos de licenciamento.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL via Docker Compose
- Zod, React Hook Form, Recharts, date-fns e Lucide React

## Premissa importante

Esta primeira versao nao implementa autenticacao. Nao ha login, logout, sessao real, middleware de auth ou protecao de rotas.

O sistema usa contexto demo fixo:

- Empresa: NTN Engenharia Demo
- Usuario: Administrador Demo
- E-mail: admin.demo@terminaldocs.local

A estrutura ja possui `companyId`, `createdBy`, `updatedBy`, `uploadedBy` e `userId` para permitir uma autenticacao real em fase futura.

## Configuracao local

1. Instale dependencias:

```bash
npm install
```

2. Copie o env:

```bash
cp .env.example .env
```

3. Suba o PostgreSQL:

```bash
docker compose up -d
```

4. Rode migrations e seed:

```bash
npm run prisma:migrate
npm run prisma:seed
```

5. Inicie o servidor:

```bash
npm run dev
```

Acesse `http://localhost:3000`.

## Uploads

Arquivos enviados no MVP sao salvos em `uploads/`. A camada `lib/storage/local-storage.ts` isola o storage para futura migracao para S3, Supabase Storage, Cloudflare R2 ou equivalente.

## Scripts uteis

- `npm run dev`: servidor de desenvolvimento
- `npm run build`: gera Prisma Client e build de producao
- `npm run lint`: lint
- `npm run prisma:migrate`: cria/aplica migrations
- `npm run prisma:seed`: popula dados demo

## Proximos passos recomendados

- Substituir `lib/demo-context.ts` por contexto autenticado.
- Implementar RBAC por empresa, terminal e papel.
- Adicionar storage externo.
- Criar exportacao ZIP/PDF de dossies.
- Adicionar OCR e busca semantica em fase posterior.
# ndocs
