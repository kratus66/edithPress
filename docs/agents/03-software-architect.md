# Agente 03 — Software Architect
**Proyecto**: EdithPress — SaaS CMS Platform
**Rol**: Software Architect
**Chat dedicado**: Sí — abrir chat nuevo, decir "Actúa como Software Architect de EdithPress, lee docs/agents/03-software-architect.md"

---

## Responsabilidades
- Diseñar la arquitectura del sistema (C4 diagrams)
- Tomar y documentar decisiones de arquitectura (ADRs)
- Configurar el monorepo (Turborepo + pnpm workspaces)
- Definir contratos de API (OpenAPI 3.0 spec)
- Establecer patrones: multi-tenancy, autenticación, manejo de errores
- Garantizar que la arquitectura sea escalable y segura
- Revisar código de todos los agentes para alineación arquitectónica

## Stack / Herramientas
- Turborepo (build system del monorepo)
- pnpm workspaces
- TypeScript estricto en todos los paquetes
- ESLint + Prettier compartidos
- Husky + lint-staged (pre-commit hooks)

## Dependencias con otros agentes
- Entrega a: todos (decisiones de arquitectura, estructura de carpetas, contratos)
- Recibe de: PM (prioridades), BA (requisitos de negocio), Security (restricciones)

---

## Arquitectura del Sistema

### Visión General (C4 — Nivel 1: Contexto)
```
[Cliente Final] → [Sitio Público - renderer.edithpress.com/{tenant}]
[Tenant Admin]  → [Panel Admin - admin.edithpress.com]
[Super Admin]   → [Panel Admin - admin.edithpress.com/super]
[Tenant Admin]  → [Page Builder - builder.edithpress.com]
Todos           → [API - api.edithpress.com]
```

### Aplicaciones (C4 — Nivel 2: Contenedores)
| App | Puerto dev | Tecnología | Descripción |
|-----|-----------|-----------|-------------|
| `apps/api` | 3001 | NestJS + TypeScript | API REST + autenticación + lógica de negocio |
| `apps/admin` | 3000 | Next.js 14 App Router | Panel super-admin + dashboard de tenant |
| `apps/builder` | 3002 | Next.js 14 + Puck | Editor visual drag-and-drop |
| `apps/renderer` | 3003 | Next.js 14 ISR | Renderizador de sitios públicos por tenant |

### Paquetes compartidos
| Paquete | Descripción |
|---------|-------------|
| `packages/database` | Prisma schema + cliente generado + migrations |
| `packages/types` | TypeScript types/interfaces compartidos (DTOs, enums) |
| `packages/ui` | Design system: componentes React + Tailwind |
| `packages/config` | ESLint, Prettier, TypeScript configs base |

---

## Estructura de Directorios Completa
```
edithpress/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   ├── tenants/
│   │   │   │   ├── sites/
│   │   │   │   ├── pages/
│   │   │   │   ├── content/
│   │   │   │   ├── media/
│   │   │   │   ├── templates/
│   │   │   │   ├── billing/
│   │   │   │   ├── domains/
│   │   │   │   └── analytics/
│   │   │   ├── common/
│   │   │   │   ├── decorators/
│   │   │   │   ├── guards/
│   │   │   │   ├── interceptors/
│   │   │   │   ├── filters/
│   │   │   │   └── pipes/
│   │   │   ├── config/
│   │   │   └── main.ts
│   │   ├── test/
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── admin/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/
│   │   │   │   ├── (super-admin)/
│   │   │   │   │   └── dashboard/
│   │   │   │   └── (tenant)/
│   │   │   │       ├── sites/
│   │   │   │       ├── billing/
│   │   │   │       └── settings/
│   │   │   ├── components/
│   │   │   ├── lib/
│   │   │   └── hooks/
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── builder/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── blocks/      # Componentes arrastrables
│   │   │   │   ├── panels/      # Panel de propiedades
│   │   │   │   └── toolbar/
│   │   │   └── lib/
│   │   ├── Dockerfile
│   │   └── package.json
│   └── renderer/
│       ├── src/
│       │   ├── app/
│       │   │   └── [tenant]/
│       │   │       └── [[...slug]]/
│       │   ├── components/
│       │   │   └── blocks/      # Mismos bloques, modo read-only
│       │   └── lib/
│       ├── Dockerfile
│       └── package.json
├── packages/
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── src/
│   │   │   └── index.ts         # Export PrismaClient singleton
│   │   └── package.json
│   ├── types/
│   │   ├── src/
│   │   │   ├── auth.ts
│   │   │   ├── tenant.ts
│   │   │   ├── site.ts
│   │   │   ├── page.ts
│   │   │   ├── content.ts
│   │   │   ├── billing.ts
│   │   │   └── index.ts
│   │   └── package.json
│   ├── ui/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   └── index.ts
│   │   └── package.json
│   └── config/
│       ├── eslint-base.js
│       ├── prettier.js
│       ├── tsconfig.base.json
│       └── package.json
├── infrastructure/
│   ├── docker/
│   │   ├── nginx/
│   │   │   └── nginx.conf
│   │   └── postgres/
│   │       └── init.sql
│   └── scripts/
│       ├── setup.sh
│       └── seed.ts
├── docs/
│   ├── agents/                  # Archivos de contexto de agentes
│   ├── adr/                     # Architecture Decision Records
│   └── api/                     # OpenAPI specs
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── docker-compose.yml
├── docker-compose.prod.yml
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## Patrones de Arquitectura

### Multi-tenancy
- Estrategia: **Row-level isolation** — todos los datos tienen `tenantId`
- Middleware de NestJS extrae `tenantId` del JWT y lo inyecta en cada request
- Prisma extension/middleware agrega `WHERE tenantId = X` automáticamente
- Storage: `s3://edithpress-media/{tenantId}/...`

### Autenticación y Autorización
- JWT Access Token: 15 minutos de vida
- Refresh Token: 7 días, rotación automática, guardado en httpOnly cookie
- RBAC con roles: `SUPER_ADMIN | TENANT_OWNER | TENANT_EDITOR | TENANT_VIEWER`
- Guards de NestJS: `@Roles()` decorator

### API Design
- REST para CRUD estándar
- Prefijo global: `/api/v1/`
- Respuesta estándar: `{ data, meta, error }`
- Paginación: cursor-based para listas grandes
- Versionado: header `API-Version` o path `/v1/`, `/v2/`

---

## ADRs (Architecture Decision Records)
| ID | Decisión | Estado |
|----|---------|--------|
| ADR-001 | Turborepo + pnpm para monorepo | Aceptada |
| ADR-002 | NestJS para API (vs Express/Fastify) | Aceptada |
| ADR-003 | Next.js App Router para frontend | Aceptada |
| ADR-004 | PostgreSQL con row-level tenant isolation | Aceptada |
| ADR-005 | Puck editor para page builder | Pendiente de validación |
| ADR-006 | Cloudflare para DNS y custom domains | Pendiente |

---

## Checklist de Progreso

### FASE 0 — Setup
- [x] Arquitectura del sistema diseñada
- [x] Estructura de directorios definida
- [x] ADRs principales documentados
- [ ] turbo.json configurado
- [ ] pnpm-workspace.yaml configurado
- [ ] package.json raíz configurado
- [ ] tsconfig.base.json en packages/config
- [ ] ESLint config base creado
- [ ] Prettier config creado
- [ ] .gitignore completo
- [ ] README.md inicial

### FASE 1 — MVP
- [ ] OpenAPI spec completa para endpoints MVP
- [ ] Contratos TypeScript en packages/types
- [ ] Revisión de arquitectura de módulos NestJS
- [ ] Revisión de estructura de Next.js apps

### FASE 2 — v1
- [ ] ADR para sistema de plugins
- [ ] Arquitectura de dominios custom documentada
- [ ] Revisión de performance (ISR estrategia)

---

## Estado Actual
**Fase activa**: FASE 0
**Última actualización**: 2026-03-27
