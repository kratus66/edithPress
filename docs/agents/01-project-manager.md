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

## Estado Actual
**Fase activa**: FASE 0 — Setup
**Última actualización**: 2026-03-27
**Progreso global**: 2/8 tasks de Fase 0 completadas
