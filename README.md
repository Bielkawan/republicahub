# RepúblicaHub

SaaS de gestão para moradias estudantis (repúblicas): propriedades, quartos, moradores e pagamentos.

## Stack

- **Backend**: Express 5 + TypeScript + Prisma 7 + PostgreSQL + JWT + Zod (`src/`)
- **Frontend**: React 19 + Vite + Tailwind CSS 4 (`web/`)

## Como rodar

Pré-requisitos: Node 22+ e PostgreSQL rodando.

```bash
# 1. Configure o banco
cp .env.example .env   # ajuste DATABASE_URL se preciso

# 2. Backend
npm install
npx prisma migrate dev
npm run seed           # cria dono@republica.com / republica123 + dados de exemplo
npm run dev            # API em http://localhost:3000/api

# 3. Frontend (outro terminal)
cd web && npm install
npm run dev            # app em http://localhost:5173
```

O Vite faz proxy de `/api` para `localhost:3000`, então front e back ficam conectados sem configuração extra (CORS também está habilitado na API).

## API

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register` | Criar usuário |
| POST | `/api/auth/login` | Login (retorna JWT) |
| GET | `/api/auth/me` | Usuário logado |
| GET/POST/DELETE | `/api/properties[/:id]` | Propriedades |
| GET/POST/PATCH/DELETE | `/api/rooms[/:id]` | Quartos |
| GET/POST/PATCH | `/api/tenants[/:id]` | Moradores |
| GET/POST/PATCH | `/api/payments[/:id]` | Pagamentos |
| POST | `/api/payments/:id/pay` | Marcar pagamento como pago |
| GET | `/api/dashboard` | Resumo (cards + pagamentos recentes) |

Todas as rotas exceto `/api/auth/*` exigem `Authorization: Bearer <token>`.
