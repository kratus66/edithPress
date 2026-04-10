# Agente 06 — Frontend Developer (Admin Panel)
**Proyecto**: EdithPress — SaaS CMS Platform
**Rol**: Frontend Developer — Admin Panel & Dashboard
**Chat dedicado**: Sí — abrir chat nuevo, decir "Actúa como Frontend Admin Developer de EdithPress, lee docs/agents/06-frontend-admin.md"

---

## Responsabilidades
- Panel super-admin (gestión de todos los tenants y métricas globales)
- Dashboard del tenant (mis sitios, analítica, facturación)
- Gestión de dominios y configuración del sitio
- Template marketplace UI (explorar y aplicar templates)
- Integración con Stripe Customer Portal
- Flujo completo de onboarding de nuevos clientes
- Navegación y layout general del admin

## Stack
- Next.js 14 App Router, TypeScript strict
- Tailwind CSS + shadcn/ui
- React Query (TanStack Query) para data fetching
- React Hook Form + Zod para formularios
- Recharts para gráficas de analítica
- next-auth para sesión en el frontend
- Zustand para estado global ligero

## Dependencias con otros agentes
- Recibe de: Backend (API endpoints), UX (diseños, design system), UI package (componentes)
- Entrega a: Builder (context del site actual)

---

## Estructura de Rutas (App Router)

```
apps/admin/src/app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── verify-email/
│       └── page.tsx
│
├── (super-admin)/            # Solo SUPER_ADMIN
│   └── layout.tsx
│   ├── dashboard/
│   │   └── page.tsx          # MRR, tenants activos, churn
│   ├── tenants/
│   │   ├── page.tsx          # Lista de todos los tenants
│   │   └── [tenantId]/
│   │       └── page.tsx      # Detalle de tenant
│   └── plans/
│       └── page.tsx          # Gestión de planes
│
├── (tenant)/                 # OWNER | EDITOR | VIEWER
│   └── layout.tsx            # Sidebar con tenant info
│   ├── onboarding/
│   │   └── page.tsx          # Wizard de setup inicial
│   ├── dashboard/
│   │   └── page.tsx          # Resumen: sitios, visitas, plan
│   ├── sites/
│   │   ├── page.tsx          # Lista de sitios del tenant
│   │   ├── new/
│   │   │   └── page.tsx      # Crear sitio (elegir template)
│   │   └── [siteId]/
│   │       ├── page.tsx      # Detalle del sitio
│   │       ├── pages/
│   │       │   └── page.tsx  # Lista de páginas del sitio
│   │       └── settings/
│   │           └── page.tsx  # Config del sitio (SEO, etc.)
│   ├── templates/
│   │   └── page.tsx          # Marketplace de templates
│   ├── media/
│   │   └── page.tsx          # Biblioteca de medios
│   ├── domains/
│   │   └── page.tsx          # Gestión de dominios custom
│   ├── analytics/
│   │   └── page.tsx          # Dashboard de visitas
│   ├── billing/
│   │   ├── page.tsx          # Plan actual, facturas
│   │   └── upgrade/
│   │       └── page.tsx      # Comparador de planes
│   └── settings/
│       └── page.tsx          # Perfil, contraseña, notificaciones
│
└── layout.tsx                # Root layout
```

---

## Pantallas Clave — Detalle

### 1. Onboarding Wizard (pasos)
1. **Bienvenida** — nombre del negocio
2. **Tipo de sitio** — portfolio, restaurante, tienda, servicios...
3. **Elige template** — grid de templates filtrable
4. **Nombre del sitio** — genera subdominio automáticamente
5. **¡Listo!** — CTA "Empezar a editar mi sitio"

### 2. Dashboard del Tenant
- Cards: Sitios activos, Páginas publicadas, Visitas (30d), Plan actual
- Gráfica de visitas (últimos 30 días)
- Lista de sitios con estado (publicado/borrador)
- Banner de upgrade si está en plan limitado

### 3. Gestión de Sitios
- Lista con thumbnail, nombre, URL, estado, fecha última edición
- Botones: Editar (→ builder), Ver sitio, Configurar, Eliminar
- Botón "Nuevo sitio" (limitado según plan)

### 4. Marketplace de Templates
- Grid de templates con preview image, nombre, categoría, tag premium
- Filtros: categoría, gratis/premium
- Modal de preview con screenshots
- Botón "Usar este template" → crea sitio con template

### 5. Gestión de Dominios
- Dominio actual (subdominio .edithpress.com)
- Form para agregar dominio custom
- Instrucciones DNS step-by-step
- Estado de verificación (pendiente/verificado/error)

### 6. Super Admin Dashboard
- KPIs: MRR, ARR, Tenants activos, Churn rate, Nuevos esta semana
- Tabla de tenants con búsqueda y filtros
- Acciones: suspender, ver detalles, cambiar plan

---

## Componentes Principales
```
components/
├── layout/
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   └── MobileNav.tsx
├── dashboard/
│   ├── StatsCard.tsx
│   ├── VisitsChart.tsx
│   └── SitesList.tsx
├── sites/
│   ├── SiteCard.tsx
│   ├── NewSiteModal.tsx
│   └── SiteSettings.tsx
├── templates/
│   ├── TemplateGrid.tsx
│   ├── TemplateCard.tsx
│   └── TemplatePreviewModal.tsx
├── billing/
│   ├── PlanCard.tsx
│   ├── PlanComparator.tsx
│   └── InvoicesList.tsx
├── media/
│   ├── MediaLibrary.tsx
│   ├── MediaUploader.tsx
│   └── MediaGrid.tsx
└── common/
    ├── PageHeader.tsx
    ├── EmptyState.tsx
    ├── ConfirmModal.tsx
    └── LoadingSpinner.tsx
```

---

## Checklist de Progreso

### FASE 0
- [x] Rutas y estructura de pantallas definidas
- [x] Componentes principales identificados
- [ ] apps/admin inicializado (Next.js + Tailwind + shadcn/ui)
- [ ] Layout raíz configurado (fuentes, metadata)
- [ ] next-auth configurado (sesión con JWT de la API)
- [ ] React Query provider configurado
- [ ] Axios/fetch client configurado (base URL de API)
- [ ] Página de login funcional

### FASE 1 — MVP
- [ ] Pantalla de registro + login completa
- [ ] Onboarding wizard (5 pasos)
- [ ] Dashboard de tenant (cards + gráfica)
- [ ] Lista de sitios + crear nuevo sitio
- [ ] Lista de páginas del sitio
- [ ] Marketplace de templates (básico)
- [ ] Billing: ver plan actual + botón checkout
- [ ] Settings básico (perfil de usuario)
- [ ] Super admin: lista de tenants

### FASE 2 — v1
- [ ] Gestión de dominios custom (UI + verificación)
- [ ] Media library completa (upload, grid, delete)
- [ ] Dashboard analítica (gráficas de visitas)
- [ ] Billing: portal Stripe + historial de facturas
- [ ] Onboarding mejorado con tour guiado
- [ ] Responsive completo (mobile)

---

## Estado Actual
**Fase activa**: FASE 0
**Última actualización**: 2026-03-27
