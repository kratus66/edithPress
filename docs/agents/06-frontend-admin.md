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
- [x] apps/admin inicializado (Next.js 14 App Router + Tailwind + packages/ui)
- [x] Layout raíz configurado (fuentes, metadata)
- [x] Axios client configurado con interceptors (api-client.ts)
- [x] Página de login funcional

### FASE 1 — MVP
- [x] Pantalla de login completa (React Hook Form + Zod + ?reset=true alert)
- [x] Pantalla de registro completa
- [x] Pantalla de verify-email
- [x] Middleware de autenticación (middleware.ts — protege rutas, cookie-based sessions)
- [x] Session API route (POST/DELETE/GET /api/auth/session)
- [x] api-client.ts migrado de localStorage a document.cookie
- [x] useLogin.ts corregido (respuesta real de API + saveSession)
- [x] Forgot password page (/forgot-password)
- [x] Reset password page (/reset-password?token=...)
- [x] Dashboard de tenant (cards con datos reales del API)
- [x] Lista de sitios + crear nuevo sitio
- [x] Media library (upload drag-and-drop, grid, delete, copy URL, búsqueda, filtros por tipo)
- [x] Billing: ver plan actual + botón checkout (Stripe)
- [x] Super admin: dashboard con MRR/stats, lista de tenants, gestión de planes
- [ ] Onboarding wizard (5 pasos)
- [ ] Lista de páginas del sitio
- [ ] Settings básico (perfil de usuario)

### FASE 2 — v1
- [ ] Gestión de dominios custom (UI + verificación)
- [ ] Dashboard analítica (gráficas de visitas)
- [ ] Billing: portal Stripe + historial de facturas
- [ ] Onboarding mejorado con tour guiado
- [ ] Responsive completo (mobile)

---

## Buenas Prácticas de Frontend (Next.js / Admin)

### Estructura y componentes
- **Server Components por defecto** — solo usar `'use client'` cuando sea necesario (interactividad, hooks, browser APIs)
- **Co-ubicación**: los componentes específicos de una ruta van en la carpeta de esa ruta, no en `/components` global
- **`/components` global** solo para componentes usados en 3+ lugares distintos
- Nunca poner lógica de negocio en los componentes — extraer a hooks (`useAuth`, `useSites`, etc.)

### Data fetching
- Server Components hacen fetch directo a la API (no React Query)
- Client Components usan React Query para datos mutables y actualizaciones en tiempo real
- Siempre manejar los 3 estados: `isLoading`, `isError`, `data`
- Usar `Suspense` + `loading.tsx` para loading states automáticos en App Router

### Formularios
- React Hook Form + Zod para validación — el schema Zod define tanto el tipo TS como las reglas de validación
- Nunca hacer `e.preventDefault()` manual — React Hook Form lo maneja
- Mensajes de error claros y específicos (no "Campo inválido" — "El email debe tener formato válido")
- Deshabilitar el botón submit mientras el form está enviando (evitar doble submit)

### Performance
- `next/image` para TODAS las imágenes — nunca `<img>` directa
- `next/link` para TODA la navegación interna — nunca `<a href>`
- Skeleton loaders en listas que hacen fetch (evitar layout shift)
- Lazy load de componentes pesados con `dynamic(() => import(...))`

### Accesibilidad (no negociable)
- Todo elemento interactivo tiene texto accesible (label, aria-label, o aria-labelledby)
- Formularios con `<label htmlFor>` asociado al input
- Contraste mínimo 4.5:1 para texto (verificar con el design system)
- Navegación por teclado funcional en todos los modales y dropdowns

---

## Tareas Asignadas — FASE 0 (Activa)

> Depende de: ARCH-01/02 (monorepo), packages/ui (Agente 12)

### Tarea ADMIN-01 — Inicializar apps/admin con Next.js 14
**Prioridad**: CRÍTICA
**Criterio de Done**: `pnpm dev` en `apps/admin` levanta en puerto 3000 y muestra una página de placeholder
**Pasos**:
1. Verificar dependencias en `package.json`
2. Crear `apps/admin/next.config.js` con configuración base
3. Crear `apps/admin/src/app/layout.tsx` (root layout con fuente Inter y metadata global)
4. Crear `apps/admin/src/app/page.tsx` con placeholder de "EdithPress Admin — Coming Soon"

### Tarea ADMIN-02 — Configurar Tailwind CSS + shadcn/ui
**Prioridad**: CRÍTICA
**Criterio de Done**: Un componente `<Button>` de shadcn/ui se renderiza correctamente con estilos
**Pasos**:
1. Crear `tailwind.config.ts` con los colores del design system (ver Agente 12)
2. Crear `postcss.config.js`
3. Crear `src/app/globals.css` con las variables CSS del design system
4. Inicializar shadcn/ui: `npx shadcn-ui@latest init`
5. Instalar componentes base: Button, Input, Card, Badge, Alert, Dialog

### Tarea ADMIN-03 — Configurar React Query provider
**Prioridad**: ALTA
**Criterio de Done**: Cualquier `useQuery()` en un Client Component funciona sin errores
**Archivo**: `apps/admin/src/app/providers.tsx`

### Tarea ADMIN-04 — Configurar cliente HTTP (axios)
**Prioridad**: ALTA
**Criterio de Done**: Una llamada `api.get('/health')` retorna datos de la API sin errores de CORS
**Archivo**: `apps/admin/src/lib/api-client.ts`
**Configurar**:
- Base URL desde `NEXT_PUBLIC_API_URL`
- Interceptor para agregar `Authorization: Bearer {token}` automáticamente
- Interceptor de respuesta para manejar errores 401 (redirect a login)

### Tarea ADMIN-05 — Página de login funcional
**Prioridad**: ALTA
**Criterio de Done**: El formulario de login llama a `POST /api/v1/auth/login` y redirige al dashboard
**Ruta**: `apps/admin/src/app/(auth)/login/page.tsx`
**Depende de**: API-01/API-02 (backend corriendo), ADMIN-04 (cliente HTTP)

---

## Estado Actual
**Fase activa**: FASE 1 — MVP
**Última actualización**: 2026-04-16
**Completado en Sprint 02**: middleware.ts, /api/auth/session route, api-client cookie migration, useLogin fix, forgot-password page, reset-password page, login ?reset=true alert, media library type filter tabs
**Próxima tarea**: Onboarding wizard (5 pasos), settings de perfil, lista de páginas por sitio
