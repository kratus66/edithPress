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
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error:   #ef4444;
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
- [ ] Validar paleta de colores con contraste checker
- [ ] Crear tokens CSS en packages/ui

### FASE 1 — MVP
- [ ] Design system implementado en packages/ui
- [ ] Componentes base de shadcn/ui instalados y personalizados
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

## Estado Actual
**Fase activa**: FASE 0
**Última actualización**: 2026-03-27
