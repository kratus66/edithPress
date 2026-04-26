# Agente 01 — Project Manager
**Proyecto**: EdithPress — SaaS CMS Platform
**Rol**: Project Manager
**Chat dedicado**: Sí — abrir chat nuevo, decir "Actúa como PM de EdithPress, lee docs/agents/01-project-manager.md"

---

## Responsabilidades
- Definir y mantener el roadmap del proyecto
- Coordinar dependencias entre agentes
- Mantener el kanban de tareas actualizado
- Gestionar riesgos y bloqueos
- Definir "Definition of Done" por feature
- Asegurar que cada agente tenga su contexto claro

## Stack / Herramientas
- GitHub Projects o Linear para kanban
- Conventional Commits para mensajes de git
- Semantic Versioning (semver) para releases
- Changelog automático

## Dependencias con otros agentes
- Recibe: reportes de progreso de todos los agentes
- Entrega a: todos (coordinación y prioridades)

---

## Roadmap General

### FASE 0 — Setup (Semana 1)
Objetivo: Monorepo funcionando, entorno de desarrollo listo.

### FASE 1 — MVP (Semanas 2–6)
Objetivo: Registro → Crear sitio → Editar página → Publicar → Pagar.

### FASE 2 — v1 (Semanas 7–14)
Objetivo: Producto completo y vendible en producción.

### FASE 3 — v2 (Semanas 15–24)
Objetivo: E-commerce, blog, plugins, white-label.

---

## Checklist de Progreso

### FASE 0 — Setup ✅ COMPLETADA
- [x] Plan maestro del proyecto aprobado
- [x] Archivos de contexto de los 12 agentes creados
- [x] Repositorio Git inicializado
- [x] Monorepo Turborepo + pnpm configurado
- [x] Docker Compose funcionando (Postgres + Redis + MinIO + Mailpit)
- [x] Variables de entorno base definidas (.env.example)
- [x] CI básico configurado (GitHub Actions)
- [x] Todos los agentes tienen su contexto claro

### FASE 1 — MVP ✅ COMPLETADA (commit dd474c1 + 7a157c4)
- [x] Auth: registro + login funcionando
- [x] Tenant creation + subdominio asignado
- [x] CRUD de sitios y páginas (API)
- [x] Page builder básico (8 componentes: Hero, Text, Image, Button, Separator, Gallery, ContactForm, CardGrid)
- [x] Renderer básico (sitio público visible con ISR + Draft Mode)
- [x] Stripe checkout integrado (plan Starter)
- [x] Admin panel básico operativo
- [ ] Deploy en staging
- [x] Tests E2E del flujo auth completo (17 tests)

### Sprint 03.1 — Estado Final (Cerrado 2026-04-25)
- [x] NavbarBlock registrado en builder + renderer
- [x] ProductGridBlock creado en builder + renderer
- [x] StatsBlock creado en builder + renderer
- [x] NewsletterBlock creado en builder + renderer
- [x] Endpoint newsletter subscription implementado (apps/api/src/modules/newsletter/)
- [x] Todos los builds pasan sin errores TypeScript
- [x] Tests: 167 pasando, 0 fallando (sprint 03.1 + fix bugs)

### FASE 2 — v1 (Sprint 03 — EN PROGRESO desde 2026-04-19)

> Agentes ejecutando en paralelo. Ver estado detallado en la sección "Sprint 02".

- [ ] Template marketplace (10 templates)
- [ ] Custom domains verificados
- [x] Media library — upload + filtros + paginación server-side (Agente 06 ✅)
- [x] SEO: sitemap.ts + robots.ts dinámicos (Agente 08 ✅)
- [x] SEO: OG tags mejorados (Agente 08 ✅)
- [ ] Dashboard de analítica
- [x] Onboarding: forgot-password + reset-password (Agente 06 ✅)
- [x] Email transaccional — módulo Mailer con Resend (Agente 05 ✅)
- [ ] Todos los planes de Stripe activos
- [ ] Deploy en producción
- [ ] Documentación básica

### FASE 3 — v2
- [ ] E-commerce (catálogo, carrito, checkout)
- [ ] Blog/CMS (posts, categorías, tags)
- [ ] Formularios personalizables
- [ ] Multi-idioma (i18n)
- [ ] API pública documentada
- [ ] White-label para agencias
- [ ] Plugin marketplace
- [ ] Analítica avanzada

---

## Riesgos Identificados
| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|-------------|------------|
| Page builder complejo de implementar | Alto | Alta | Usar librería existente (Puck/Craft.js) |
| Custom domains técnicamente complejos | Alto | Media | Cloudflare API + wildcard DNS |
| Multi-tenancy mal implementado | Crítico | Media | Code reviews de arquitectura desde el inicio |
| Churn de clientes por UX pobre | Alto | Media | Testing con usuarios reales desde MVP |

---

## Log de Decisiones
| Fecha | Decisión | Motivo |
|-------|---------|--------|
| 2026-03-27 | Turborepo + pnpm para monorepo | Performance de builds y workspaces |
| 2026-03-27 | NestJS para API | Estructura empresarial, decoradores, DI |
| 2026-03-27 | Next.js 14 App Router | SSG/ISR nativo para renderer de sitios |
| 2026-03-27 | PostgreSQL + Prisma | Tipado fuerte, migraciones automáticas |
| 2026-03-27 | Stripe para pagos | Mejor SDK, webhooks confiables |

---

## Buenas Prácticas de Gestión de Proyectos

### Comunicación entre agentes
- Cada agente debe reportar bloqueos **el mismo día** que ocurren — no acumular
- Decisiones que afectan a más de un agente se documentan en el **Log de Decisiones** antes de ejecutar
- Ningún agente empieza una tarea sin que sus dependencias estén marcadas como `[x]`

### Definition of Done (DoD) — aplica a toda tarea de código
Una tarea está **Done** cuando cumple TODOS estos criterios:
1. El código está en el repositorio (`git push`)
2. Los tests pasan (`pnpm test`)
3. No hay errores de TypeScript (`pnpm typecheck`)
4. No hay warnings de ESLint (`pnpm lint`)
5. El Checklist del agente tiene el ítem marcado como `[x]`
6. Si tiene UI: se revisó en mobile y desktop

### Gestión del Roadmap
- Las fases son secuenciales: no se empieza FASE 1 hasta completar FASE 0 al 100%
- Si una tarea está bloqueada más de 2 días → escalar con contexto claro (qué se intentó, qué falló)
- Conventional Commits obligatorio: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`

### Convención de ramas
```
main          → código estable, siempre deployable
develop       → integración continua
feat/{nombre} → features nuevas
fix/{nombre}  → bug fixes
chore/{nombre}→ setup, configuración, docs
```

---

## Tareas Asignadas — FASE 0 y FASE 1 ✅ COMPLETADAS

> PM-01 al PM-05 completadas. Ver commits: dd474c1 (admin FASE 1), 7a157c4 (builder+renderer FASE 1).

---

## Sprint 02 — Estado por Agente (2026-04-17)

### Agente 05 — Backend Developer
| Tarea | Estado | Evidencia |
|-------|--------|-----------|
| Redis module (revocación refresh tokens) | ✅ Done | `apps/api/src/modules/redis/` |
| Stripe webhook handlers completos | ⚠️ Verificar | `billing.service.ts` modificado |
| Módulo Mailer (Resend) | ✅ Done | `apps/api/src/modules/mailer/` |
| Flujo Password Reset (forgotPassword + resetPassword) | ✅ Done | `forgot-password.dto.ts`, `reset-password.dto.ts` |
| Módulo Super Admin (/admin/*) | ✅ Done | `apps/api/src/modules/admin/` (4 archivos) |

### Agente 06 — Frontend Admin
| Tarea | Estado | Evidencia |
|-------|--------|-----------|
| Middleware de autenticación (httpOnly cookies) | ✅ Done | `apps/admin/src/middleware.ts` |
| Página forgot-password | ✅ Done | `apps/admin/src/app/(auth)/forgot-password/page.tsx` |
| Página reset-password | ✅ Done | `apps/admin/src/app/(auth)/reset-password/page.tsx` |
| API routes de sesión | ✅ Done | `apps/admin/src/app/api/` |
| Media Library funcional (drag-and-drop + paginación) | ✅ Done | `media/page.tsx` — upload, filtros, clipboard, delete, paginación server-side (page/limit=24) |
| Super Admin dashboard con datos reales | ✅ Done | Llama endpoints reales `/admin/stats` y `/admin/tenants` |

### Agente 07 — Frontend Builder
| Tarea | Estado | Evidencia |
|-------|--------|-----------|
| Autosave con indicador de estado | ✅ Done | `apps/builder/src/hooks/useAutosave.ts` |
| Toolbar mejorada (3 zonas) | ✅ Done | `apps/builder/src/components/BuilderToolbar.tsx` |
| Preview en iframe (Drawer) | ✅ Done | `apps/builder/src/components/PreviewDrawer.tsx` |
| Verificar campos de bloques en Puck Config | ✅ Done | `HeroBlock.tsx` + `BuilderEditor.tsx` modificados |

### Agente 08 — Frontend Renderer
| Tarea | Estado | Evidencia |
|-------|--------|-----------|
| Reemplazar `<img>` por `next/image` en bloques | ✅ Done | `CardGridBlock.tsx`, `GalleryBlock.tsx` modificados |
| Sitemap dinámico | ✅ Done | `apps/renderer/src/app/sitemap.ts` |
| Robots.txt dinámico | ✅ Done | `apps/renderer/src/app/robots.ts` |
| Meta Tags OG completos | ✅ Done | `page.tsx` modificado |
| Páginas de error por tenant | ✅ Done | `apps/renderer/src/app/error.tsx` |

### Agente 09 — DevOps Engineer
| Tarea | Estado | Evidencia |
|-------|--------|-----------|
| .env.example actualizado y completo | ✅ Done | `.env.example` modificado |
| Dockerfiles multi-stage (4 apps) | ✅ Done | `apps/{api,admin,builder,renderer}/Dockerfile` |
| docker-compose.prod.yml | ✅ Done | `docker-compose.prod.yml` en raíz |
| Nginx reverse proxy | ✅ Done | `infrastructure/nginx/nginx.prod.conf` |
| GitHub Actions CI completo (con Postgres + Redis) | ✅ Done | `.github/workflows/ci.yml` — 3 jobs: lint, test, build |

### Agente 10 — Security Engineer
| Tarea | Estado | Evidencia |
|-------|--------|-----------|
| Sanitización XSS (DOMPurify) | ✅ Done | `apps/api/src/common/utils/sanitize.ts` |
| Protección enumeración en auth | ✅ Done | `auth.service.ts` modificado |
| CSP completo en Helmet | ✅ Done | `main.ts` modificado |
| Auditoría módulo auth | ✅ Done | `docs/security-audit-sprint02.md` |

### Agente 11 — QA Testing Engineer
| Tarea | Estado | Evidencia |
|-------|--------|-----------|
| Integration tests: endpoints Sites | ✅ Done | `sites.e2e-spec.ts` — 8 casos, tenant isolation cubierto |
| Integration tests: endpoints Pages | ✅ Done | `pages.e2e-spec.ts` — 5 casos + versioning |
| CI pipeline con tests (Postgres + Redis) | ✅ Done | `ci.yml` — Postgres 16 + Redis 7, unit + e2e jobs |
| Verificar cobertura actual | ✅ Done | 167 tests totales, 100% passing |

**Cobertura por módulo (2026-04-19):**
| Módulo | Statements | Branches | Estado |
|--------|-----------|---------|--------|
| sites.service.ts | 100% | 80.95% | ✅ |
| tenants.service.ts | 100% | 92.85% | ✅ |
| pages.service.ts | 98.24% | 76.74% | ✅ |
| auth.service.ts | 75.97% | 86.2% | ⚠️ (>70% OK) |
| billing.service.ts | 66.58% | 75% | ⚠️ (< 70%, prioridad Sprint 03) |
| mailer.service.ts | 16.79% | 0% | ❌ (Sprint 03) |
| redis.service.ts | 33.92% | 0% | ❌ (Sprint 03) |

**Fix clave aplicado**: `MockRedisModule @Global()` añadido a todos los test modules para compatibilidad con la integración Redis del módulo auth (inyectada por Agente 10).

---

## Pendientes Críticos para Cerrar Sprint 02

~~Todos los bloqueantes resueltos.~~ **Sprint 02 CERRADO.**

**Deuda técnica para Sprint 03:**
- `mailer.service.ts` — cobertura 16.79% (tests unitarios pendientes)
- `redis.service.ts` — cobertura 33.92% (tests unitarios pendientes)
- `billing.service.ts` — cobertura 66.58% (por debajo del umbral del 70%)
- Deploy en staging — último ítem pendiente de FASE 1 que pasa a Sprint 03

---

## Estado Actual
**Fase activa**: FASE 2 — v1 / Sprint 03 (iniciado 2026-04-19)
**Última actualización**: 2026-04-25
**Progreso Sprint 02**: ✅ CERRADO — 126 tests passing (78 unit + 48 e2e)
**Progreso Sprint 03.1**: ✅ CERRADO — 167 tests passing, 4 bloques nuevos
**Sprint 03**: Prompts disponibles en docs/prompts/sprint-03-prompts.md
**Agentes Sprint 03**: 09 (DevOps/staging) → 04 (DB) → 05 (Backend) + 12 (UX) → 06 + 07 + 08 → 10 + 11

## Estimación de Sprints Restantes

| Sprint | Objetivo | Resultado |
|--------|---------|-----------|
| Sprint 03 (actual) | Staging deploy + Templates + Custom domains + Analytics + Cobertura ≥70% | FASE 2 cerrada |
| Sprint 04 | Deploy producción + Hardening + Docs + E-commerce básico (catálogo) | v1 VENDIBLE |
| Sprint 05 | Blog/CMS + Formularios avanzados + Multi-idioma | FASE 3 inicio |
| Sprint 06 | API pública + Plugin marketplace + Analítica avanzada | FASE 3 avance |
| Sprint 07 | White-label + Performance + Onboarding mejorado | FASE 3 cierre |

**Total restante para v1 vendible**: ~2 sprints (Sprint 03 + 04)
**Total restante para v2 completo**: ~5 sprints
