# Agente 12 — UX Designer
**Proyecto**: EdithPress — SaaS CMS Platform
**Rol**: UX Designer
**Chat dedicado**: Sí — abrir chat nuevo, decir "Actúa como UX Designer de EdithPress, lee docs/agents/12-ux-designer.md"

---

## Responsabilidades
- Design system (colores, tipografía, spacing, componentes)
- Wireframes de pantallas clave
- User flows (onboarding, editor, publicación)
- Principios de accesibilidad (WCAG 2.1 AA)
- Responsive design specs (mobile first)
- Micro-interacciones y estados de feedback visual
- Validar la UX con usuarios reales (cuando haya acceso)

## Stack / Herramientas
- Design system implementado en Tailwind CSS + shadcn/ui
- Colores y tokens documentados en este archivo
- Wireframes descritos en markdown (texto + ASCII art)
- Variables CSS para theming

## Dependencias con otros agentes
- Entrega a: Frontend Admin (design system, specs), Builder (specs del editor), Renderer (estilos base para sitios)
- Recibe de: BA (user stories, flujos), PM (prioridades de UX)

---

## Design System

### Paleta de Colores
```css
:root {
  /* Primario — Azul profundo (confianza, profesionalismo) */
  --color-primary-50:  #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;   /* Principal */
  --color-primary-700: #1d4ed8;
  --color-primary-900: #1e3a8a;

  /* Acento — Violeta (creatividad, diferenciación) */
  --color-accent-500: #8b5cf6;
  --color-accent-600: #7c3aed;    /* Principal */

  /* Neutros */
  --color-gray-50:  #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-500: #6b7280;
  --color-gray-700: #374151;
  --color-gray-900: #111827;

  /* Estados */
  /* NOTA: --color-error usa #dc2626 (red-600) — #ef4444 solo da 3.76:1 (falla WCAG AA normal text) */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error:   #dc2626;   /* red-600 → 4.83:1 sobre blanco ✓ WCAG AA */
  --color-info:    #3b82f6;

  /* Backgrounds */
  --color-bg-primary:   #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-bg-tertiary:  #f3f4f6;
}
```

### Tipografía
```css
/* Fuente principal: Inter (Google Fonts) */
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
/* Fuente código: JetBrains Mono */
--font-mono: 'JetBrains Mono', monospace;

/* Escala de tamaños */
--text-xs:   0.75rem;   /* 12px */
--text-sm:   0.875rem;  /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg:   1.125rem;  /* 18px */
--text-xl:   1.25rem;   /* 20px */
--text-2xl:  1.5rem;    /* 24px */
--text-3xl:  1.875rem;  /* 30px */
--text-4xl:  2.25rem;   /* 36px */

/* Pesos */
--font-normal:   400;
--font-medium:   500;
--font-semibold: 600;
--font-bold:     700;
```

### Spacing (Tailwind default, documentado)
```
4px  → p-1, m-1
8px  → p-2, m-2
12px → p-3, m-3
16px → p-4, m-4
24px → p-6, m-6
32px → p-8, m-8
48px → p-12, m-12
64px → p-16, m-16
```

### Border Radius
```
4px  → rounded    (inputs, pequeños)
6px  → rounded-md (cards, botones)
8px  → rounded-lg (modales, panels)
12px → rounded-xl (contenedores grandes)
full → rounded-full (avatars, badges)
```

### Sombras
```
shadow-sm   → cards sutiles
shadow      → dropdowns, tooltips
shadow-md   → modales, panels flotantes
shadow-lg   → builder panels
```

---

## Componentes del Design System (shadcn/ui base)

| Componente | Uso |
|-----------|-----|
| Button | Primario, secundario, outline, destructivo, ghost |
| Input | Texto, email, password, con icono |
| Select | Dropdowns, filtros |
| Card | Contenedores de contenido |
| Badge | Planes, estados, tags |
| Alert | Éxito, error, warning, info |
| Modal/Dialog | Confirmaciones, formularios |
| Tabs | Secciones dentro de una página |
| Sidebar | Navegación principal del admin |
| Table | Listas de tenants, sitios, facturas |
| Dropdown Menu | Acciones contextuales |
| Avatar | Usuario logueado |
| Toast/Sonner | Notificaciones de acción |
| Skeleton | Loading states |
| Progress | Pasos de onboarding, subida de archivos |

---

## Wireframes — Pantallas Clave

### Login
```
┌──────────────────────────────────────┐
│           🔷 EdithPress              │
│                                      │
│  Inicia sesión en tu cuenta          │
│                                      │
│  Email                               │
│  [________________________]          │
│                                      │
│  Contraseña                          │
│  [________________________] 👁        │
│                                      │
│  [    Iniciar sesión    ]            │
│                                      │
│  ¿Olvidaste tu contraseña? | Crear   │
│                          cuenta →   │
└──────────────────────────────────────┘
```

### Dashboard del Tenant
```
┌──────────────────────────────────────────────────────┐
│ EdithPress  [Mis sitios] [Media] [Billing] [⚙]  [👤] │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Hola, Juan 👋  Plan: Starter                        │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐               │
│  │  1   │ │  3   │ │  542 │ │ 30d  │               │
│  │Sitios│ │Págs  │ │Visitas│ │Gratis│               │
│  └──────┘ └──────┘ └──────┘ └──────┘               │
│                                                      │
│  Mis sitios                      [+ Nuevo sitio]     │
│  ┌────────────────────────────────────────────┐      │
│  │ 🌐 Mi Restaurante   publicado  [Editar][⋮] │      │
│  │ 🌐 Portafolio       borrador   [Editar][⋮] │      │
│  └────────────────────────────────────────────┘      │
│                                                      │
│  ⚡ Actualiza a Business — 3 sitios, dominio propio  │
│  [Ver planes]                                        │
└──────────────────────────────────────────────────────┘
```

### Page Builder
```
┌─────────────────────────────────────────────────────────────────┐
│ ← Mi Restaurante / Inicio    [💻][📱][📟]  💾 Guardado   [Pub] │
├────────────┬────────────────────────────────────────┬───────────┤
│  BLOQUES   │                                        │ PROPIEDADES│
│            │    ┌──────────────────────────────┐   │           │
│ ≡ Hero     │    │  🖼 Hero Block                │   │ Título    │
│ ≡ Texto    │    │  "Bienvenido a nuestro       │   │ [Bienve...│
│ ≡ Imagen   │    │   restaurante"               │   │           │
│ ≡ Galería  │    │   [Contáctanos →]            │   │ Subtítulo │
│ ≡ Contacto │    └──────────────────────────────┘   │ [texto...]│
│ ≡ Botón    │                                        │           │
│ ≡ Cards    │    ┌──────────────────────────────┐   │ Fondo     │
│ ≡ Separador│    │  📝 Texto                    │   │ [#1a1a2e] │
│            │    │  "Somos un restaurante..."   │   │           │
│  PÁGINAS   │    └──────────────────────────────┘   │ Botón CTA │
│            │                                        │ [Contac...│
│ • Inicio   │    [+ Agregar bloque]                  │           │
│ • Menú     │                                        │           │
│ • Contacto │                                        │           │
└────────────┴────────────────────────────────────────┴───────────┘
```

---

## User Flows

### Onboarding (5 pasos)
```
[Registro] → [Verificar email] → [Paso 1: Nombre negocio]
→ [Paso 2: Tipo de sitio] → [Paso 3: Elige template]
→ [Paso 4: Nombre sitio/URL] → [✅ ¡Listo! → Abrir editor]
```

### Publicar página
```
[Dashboard] → [Click "Editar" en sitio] → [Builder carga]
→ [Editar contenido] → [Preview] → [Click "Publicar"]
→ [Toast: "✅ Tu sitio está publicado en mi-sitio.edithpress.com"]
```

---

## Principios de Accesibilidad (WCAG 2.1 AA)
- Contraste mínimo: 4.5:1 para texto, 3:1 para UI components
- Focus visible en todos los elementos interactivos
- Alt text obligatorio en todas las imágenes
- Formularios con labels asociados (`<label htmlFor>`)
- Navegación por teclado completa (Tab, Enter, Escape)
- ARIA labels en iconos sin texto
- Anuncios de estado con `aria-live` (guardado, errores)
- No usar solo color para transmitir información

---

## Checklist de Progreso

### FASE 0
- [x] Design system documentado (colores, tipografía, spacing)
- [x] Componentes base identificados (shadcn/ui)
- [x] Wireframes de pantallas clave (login, dashboard, builder)
- [x] User flows documentados
- [x] Principios de accesibilidad definidos
- [x] Validar paleta de colores con contraste checker — ver resultados en Tarea UX-04
- [x] Crear tokens CSS en packages/ui

### FASE 1 — MVP
- [x] Design system implementado en packages/ui
- [x] Componentes base de shadcn/ui instalados y personalizados
- [ ] Fuente Inter configurada en todas las apps
- [ ] Login y registro: UI completa
- [ ] Dashboard: UI completa
- [ ] Builder: layout y panels
- [ ] Mobile nav (hamburger) del admin

### FASE 2 — v1
- [ ] Revisión de accesibilidad con axe DevTools
- [ ] Responsive completo (mobile-first audit)
- [ ] Micro-interacciones del builder (drag feedback, hover states)
- [ ] Toast notifications (Sonner) configuradas
- [ ] Empty states ilustrados para listas vacías
- [ ] Loading skeletons para todas las listas

---

## Buenas Prácticas de UX/Design System

### Design tokens — la base de todo
- Los tokens (colores, spacing, tipografía) se definen **una sola vez** en CSS custom properties (`packages/ui`)
- Tailwind se configura para usar esos tokens — no hardcodear colores como `#3b82f6` en los componentes
- Si un color cambia, cambia en un solo lugar y se propaga a toda la aplicación
- Dark mode se planifica desde el inicio con tokens semánticos (`--color-bg-primary`) no literales (`--color-blue-600`)

### Componentes — reglas de construcción
- Cada componente del `packages/ui` es **independiente**: no importa estado global, no hace fetch
- Las variantes se definen con `cva` (class-variance-authority) — consistencia sin if/else manuales
- Todos los componentes interactivos tienen estados: default, hover, focus, active, disabled
- `aria-*` y `role` son parte del componente — no se agregan después

### Accesibilidad — integrada, no añadida
- Contraste: verificar cada color de texto con WebAIM Contrast Checker antes de usar
- Focus ring visible en TODOS los elementos interactivos (no usar `outline: none` sin reemplazo)
- Los iconos sin texto tienen `aria-label` o `title`
- El orden de Tab coincide con el orden visual

### Mobile-first
- Diseñar primero para 375px, luego expandir a 768px, luego 1280px
- Los breakpoints de Tailwind (`sm:`, `md:`, `lg:`) se usan consistentemente
- Touch targets mínimo 44x44px para elementos interactivos en mobile

---

## Tareas Asignadas — FASE 0 (Activa)

> El UX Designer entrega los tokens y componentes base que todos los frontends necesitan.

### Tarea UX-01 — Implementar tokens CSS en packages/ui
**Prioridad**: CRÍTICA — Todos los frontends dependen de esto
**Criterio de Done**: El archivo de tokens CSS existe y está exportado desde `packages/ui`
**Archivo**: `packages/ui/src/styles/tokens.css`
**Contenido**: Las variables CSS del design system definidas en este archivo (sección "Paleta de Colores" y "Tipografía")

### Tarea UX-02 — Configurar Tailwind con los tokens
**Prioridad**: CRÍTICA
**Criterio de Done**: En cualquier app, `bg-primary-600` usa el color `#2563eb` del design system
**Archivo**: `packages/ui/tailwind.config.ts` (base que las apps extienden)
```typescript
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--color-primary-50)',
          // ... todos los tokens
          600: 'var(--color-primary-600)',
        },
        accent: {
          600: 'var(--color-accent-600)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
}
```

### Tarea UX-03 — Instalar y personalizar componentes shadcn/ui base
**Prioridad**: CRÍTICA
**Criterio de Done**: Los siguientes componentes están en `packages/ui/src/components/` y usan los tokens del design system:
- Button (variantes: primary, secondary, outline, ghost, destructive)
- Input (con label, error state, helper text)
- Card
- Badge (variantes por plan: starter, business, pro)
- Alert (success, error, warning, info)

### Tarea UX-04 — Validar contraste de la paleta de colores ✅ DONE
**Prioridad**: ALTA
**Criterio de Done**: Todos los pares de color texto/fondo del design system pasan WCAG AA (4.5:1 para texto normal, 3:1 para texto grande y UI)

**Resultados (fórmula WCAG IEC 61966-2-1):**

| Par | Ratio | AA Normal | AA Grande |
|-----|-------|-----------|-----------|
| Blanco `#fff` sobre `primary-600` `#2563eb` | 5.16:1 | ✓ PASA | ✓ PASA |
| Blanco `#fff` sobre `accent-600` `#7c3aed`  | 5.70:1 | ✓ PASA | ✓ PASA |
| `gray-900` `#111827` sobre `gray-50` `#f9fafb` | 16.97:1 | ✓ PASA | ✓ PASA |
| `error` sobre blanco — `#ef4444` original | 3.76:1 | ✗ FALLA | ✓ PASA |

**Acción correctiva aplicada:** `--color-error` cambiado de `#ef4444` (red-500, 3.76:1) a `#dc2626` (red-600, **4.83:1**).
El cambio está aplicado en `tokens.css` y en el design system de este archivo.

### Tarea UX-05 — Crear componentes de layout del Admin
**Prioridad**: ALTA
**Criterio de Done**: Sidebar y Header del admin están implementados y responsive
**Depende de**: UX-03, ADMIN-02 (Tailwind configurado en admin)
**Componentes**: `Sidebar.tsx`, `Header.tsx`, `MobileNav.tsx`

---

## Estado Actual
**Fase activa**: FASE 0 → completada, iniciando FASE 1
**Última actualización**: 2026-04-13
**Completadas**: UX-01, UX-02, UX-03, UX-04
**Próxima tarea**: UX-05 — Crear componentes de layout del Admin (Sidebar, Header, MobileNav)