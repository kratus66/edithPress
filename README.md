# EdithPress

SaaS CMS platform that lets teams create and manage multi-tenant websites through a visual page builder.

## Architecture overview

```
admin.edithpress.com      → Panel admin (tenant dashboard + super-admin)
builder.edithpress.com    → Visual drag-and-drop page editor
renderer.edithpress.com   → Public site renderer (per-tenant, ISR)
api.edithpress.com        → REST API (NestJS)
```

**Monorepo** managed with [Turborepo](https://turbo.build) + [pnpm workspaces](https://pnpm.io/workspaces).

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | >= 20 | [nodejs.org](https://nodejs.org) |
| pnpm | >= 9 | `npm install -g pnpm` |
| Docker + Docker Compose | latest | [docker.com](https://www.docker.com) |
| Git | any | [git-scm.com](https://git-scm.com) |

---

## Quick start

```bash
# 1. Clone the repo
git clone https://github.com/your-org/edithpress.git
cd edithpress

# 2. Install dependencies (all workspaces)
pnpm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and fill in your values (see Environment variables section below)

# 4. Start infrastructure (Postgres, Redis, MinIO, Mailpit)
docker compose up -d

# 5. Generate Prisma client + run migrations
pnpm db:generate
pnpm db:migrate

# 6. (Optional) Seed the database with sample data
pnpm db:seed

# 7. Start all apps in development mode
pnpm dev
```

Apps will be available at:

| App | URL |
|-----|-----|
| Admin panel | http://localhost:3000 |
| API | http://localhost:3001 |
| Page builder | http://localhost:3002 |
| Public renderer | http://localhost:3003 |
| Mailpit (email UI) | http://localhost:8025 |
| MinIO console | http://localhost:9001 |

---

## Environment variables

All required variables are documented in [.env.example](.env.example).

Copy and fill before running anything:

```bash
cp .env.example .env
```

**Never commit `.env`** — it contains secrets. `.env.example` is the source of truth for the contract.

---

## Available scripts

Run from the repo root:

```bash
pnpm dev          # Start all apps in watch mode
pnpm build        # Build all apps and packages
pnpm lint         # Lint all workspaces
pnpm typecheck    # Type-check all workspaces
pnpm test         # Run unit tests across all workspaces
pnpm format       # Format all files with Prettier

pnpm db:generate  # Regenerate Prisma client
pnpm db:migrate   # Run pending migrations
pnpm db:seed      # Seed the database

pnpm clean        # Delete all build artifacts and node_modules
```

To run a script in a single workspace:

```bash
pnpm --filter api dev
pnpm --filter admin build
pnpm --filter @edithpress/database db:migrate
```

---

## Project structure

```
edithpress/
├── apps/
│   ├── api/          # NestJS REST API (port 3001)
│   ├── admin/        # Next.js admin panel (port 3000)
│   ├── builder/      # Next.js + Puck page editor (port 3002)
│   └── renderer/     # Next.js ISR public renderer (port 3003)
├── packages/
│   ├── database/     # Prisma schema, migrations, client
│   ├── types/        # Shared TypeScript types and DTOs
│   ├── ui/           # Shared React component library (Tailwind)
│   └── config/       # Shared ESLint, Prettier, tsconfig
├── infrastructure/
│   ├── docker/       # Nginx config, Postgres init scripts
│   └── scripts/      # Setup and utility scripts
├── docs/
│   ├── agents/       # Agent context files (AI-assisted development)
│   ├── adr/          # Architecture Decision Records
│   └── api/          # OpenAPI specs
├── .github/
│   └── workflows/    # CI/CD pipelines
├── docker-compose.yml
├── turbo.json
├── pnpm-workspace.yaml
└── .env.example
```

---

## Multi-tenancy

EdithPress uses **row-level tenant isolation**. Every database record carries a `tenantId`. The API middleware extracts the `tenantId` from the JWT on each request and scopes all queries automatically via a Prisma extension.

Tenant media is stored under `s3://edithpress-media/{tenantId}/`.

---

## Roles

| Role | Description |
|------|-------------|
| `SUPER_ADMIN` | Full platform access |
| `TENANT_OWNER` | Full access within their tenant |
| `TENANT_EDITOR` | Can create and edit content |
| `TENANT_VIEWER` | Read-only access |

---

## Architecture Decision Records

Key decisions are documented in [docs/adr/](docs/adr/):

| ADR | Decision |
|-----|---------|
| ADR-001 | Turborepo + pnpm for monorepo |
| ADR-002 | NestJS for the API |
| ADR-003 | Next.js App Router for all frontends |
| ADR-004 | PostgreSQL with row-level tenant isolation |
| ADR-005 | Puck editor for the page builder |
| ADR-006 | Cloudflare for DNS and custom domains |

---

## Contributing

1. Create a branch from `main`: `git checkout -b feat/your-feature`
2. Make your changes — TypeScript strict mode is enforced everywhere
3. Run `pnpm lint && pnpm typecheck && pnpm test` before pushing
4. Open a pull request against `main`

Pre-commit hooks (Husky + lint-staged) run lint and type-check automatically on every commit.
