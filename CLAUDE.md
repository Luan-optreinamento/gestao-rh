# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Stack

- **Next.js 16.2.9** with App Router and React 19 — read `node_modules/next/dist/docs/` before writing any Next.js code; this version may have breaking changes vs. training data
- **Drizzle ORM** + **Neon** (serverless PostgreSQL)
- **Tailwind CSS v4** (PostCSS plugin approach — no `tailwind.config.js`)
- **JWT** (jsonwebtoken) + **Argon2** for auth; token stored in an HTTP-only cookie named `token`
- TypeScript throughout; no test framework

## Commands

```bash
npm run dev        # start dev server
npm run build      # production build
npm run lint       # ESLint via next lint
npm run db:push    # push schema changes to Neon (no migrations, schema-push workflow)
npm run db:studio  # open Drizzle Studio
```

Environment variables required: `DATABASE_URL`, `JWT_SECRET`.

## Architecture

### Route groups

- `(auth)` — public routes (login page)
- `(dashboard)` — protected routes behind middleware; shares `layout.tsx` with Sidebar + Header

### Middleware

`src/app/middleware.ts` — guards all non-API, non-static routes. Redirects unauthenticated users to `/login` and authenticated users away from `/login` to `/dashboard`.

### Database (`src/lib/`)

- `db.ts` — single `db` export (Drizzle + Neon HTTP driver)
- `schema.ts` — all four tables: `usuarios`, `centrosCusto`, `pagamentos`, `transacoes`
- `auth.ts` — `hashSenha`, `verificarSenha`, `gerarToken`, `verificarToken`
- `utils.ts` — `uid()` (crypto.randomUUID), `fmt()` (BRL currency), `fmtData()`, `diasAteVencimento()`, `mesNome()`
- `types.ts` — shared TypeScript types (`Pagamento`, `Transacao`, `CentroCusto`)

### API routes (`src/app/api/`)

All routes follow the same pattern: import `db` and schema tables, use Drizzle queries, return `NextResponse.json`. No auth check inside API routes — they're protected at the middleware layer (middleware matcher excludes `/api`).

| Route | Purpose |
|---|---|
| `/api/auth/login` | Verify credentials, set `token` cookie |
| `/api/auth/logout` | Clear `token` cookie |
| `/api/auth/criar-usuario` | Create user with hashed password |
| `/api/pagamentos` | CRUD for payments; supports `?conta=` filter |
| `/api/centros` | CRUD for cost centers |
| `/api/transacoes` | CRUD for bank transactions; OFX import endpoint |

### Feature components (`src/components/features/`)

Client components that own their own data fetching via `fetch()` to the API routes above. Key ones:

- `TabelaPagamentos` — paginated payments table with status pills
- `ModalPagamento` — create/edit payment form
- `ModalConciliacao` — match OFX transactions to cost centers
- `RelatorioCC` — cost-center report with month/account filters
- `UploadOFX` — parses and imports OFX bank files

### UI primitives (`src/components/ui/`)

Thin wrappers: `Button`, `Input`, `Select`, `Card`, `Pill`, `Modal`, `Metric`. Use these instead of raw HTML for consistency.

## Domain

Sistema de gestão financeira para RH (HR financial management). Core entities:

- **Pagamentos** — scheduled payments with `status` (`pendente`/`pago`/`cancelado`) and `conta` (bank account identifier)
- **Transações** — OFX-imported bank transactions linked optionally to a `centroCustoId`; `conciliada` flag marks reconciled entries
- **Centros de Custo** — cost centers for categorising transactions
- **Conta** — not a DB table; just a string field (`conta`) on both `pagamentos` and `transacoes` used to segment by bank account
