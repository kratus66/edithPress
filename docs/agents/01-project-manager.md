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

### FASE 0 — Setup
- [x] Plan maestro del proyecto aprobado
- [x] Archivos de contexto de los 12 agentes creados
- [ ] Repositorio Git inicializado
- [ ] Monorepo Turborepo + pnpm configurado
- [ ] Docker Compose funcionando (Postgres + Redis)
- [ ] Variables de entorno base definidas (.env.example)
- [ ] CI básico configurado (GitHub Actions)
- [ ] Todos los agentes tienen su contexto claro

### FASE 1 — MVP
- [ ] Auth: registro + login funcionando
- [ ] Tenant creation + subdominio asignado
- [ ] CRUD de sitios y páginas (API)
- [ ] Page builder básico (5 componentes)
- [ ] Renderer básico (sitio público visible)
- [ ] Stripe checkout integrado (plan Starter)
- [ ] Admin panel básico operativo
- [ ] Deploy en staging
- [ ] Tests E2E del flujo completo

### FASE 2 — v1
- [ ] Template marketplace (10 templates)
- [ ] Custom domains verificados
- [ ] Media library completa
- [ ] SEO avanzado (sitemap, OG, meta)
- [ ] Dashboard de analítica
- [ ] Onboarding flow pulido
- [ ] Email transaccional (bienvenida, facturas)
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

## Tareas Asignadas — FASE 0 (Activa)

> Orden de ejecución: las tareas tienen dependencias. Seguir el orden indicado.

### Tarea PM-01 — Verificar estructura del monorepo
**Prioridad**: CRÍTICA — Desbloquea a todos los demás agentes
**Responsable**: PM coordina, Architect ejecuta
**Criterio de Done**: `pnpm install` corre sin errores desde la raíz
**Pasos**:
1. Confirmar que `pnpm-workspace.yaml` está creado (Agente 03)
2. Confirmar que `turbo.json` está creado (Agente 03)
3. Confirmar que todos los `package.json` de apps y packages tienen nombre `@edithpress/xxx`
4. Ejecutar `pnpm install` y verificar que no hay errores

### Tarea PM-02 — Verificar entorno de desarrollo
**Prioridad**: CRÍTICA
**Responsable**: PM coordina, DevOps ejecuta
**Criterio de Done**: `docker-compose up` levanta Postgres + Redis + MinIO + Mailpit sin errores
**Depende de**: PM-01

### Tarea PM-03 — Verificar variables de entorno
**Prioridad**: ALTA
**Responsable**: PM revisa, DevOps crea
**Criterio de Done**: `.env.example` existe con todas las variables necesarias y ningún secret real está en git
**Depende de**: PM-01

### Tarea PM-04 — Confirmar CI básico
**Prioridad**: ALTA
**Responsable**: PM coordina, DevOps ejecuta
**Criterio de Done**: GitHub Actions corre en cada push a `main` y `develop`, lint + typecheck pasan
**Depende de**: PM-01

### Tarea PM-05 — Gate de entrada a FASE 1
**Prioridad**: BLOQUEANTE
**Criterio de Done**: Los 8 ítems del checklist de FASE 0 están en `[x]` en TODOS los agentes
**Depende de**: Todas las tareas anteriores

---

## Estado Actual
**Fase activa**: FASE 0 — Setup
**Última actualización**: 2026-04-13
**Progreso global**: 2/8 tasks de Fase 0 completadas
**Próxima tarea**: PM-01 — Verificar estructura del monorepo
