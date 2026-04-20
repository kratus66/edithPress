# Design Tokens — EdithPress

**Fuente de verdad**: `packages/ui/src/styles/tokens.css`
**Última actualización**: Sprint 03 (2026-04-19)

Este documento cataloga todos los tokens del design system. Los tokens base (Sprint 01) se documentan como referencia. Los tokens nuevos de Sprint 03 están marcados claramente.

---

## Tokens base — Sprint 01

Definidos en `packages/ui/src/styles/tokens.css` y activos en toda la plataforma.

### Colores primarios

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-primary-50` | `#eff6ff` | Fondos tenues de elementos primarios |
| `--color-primary-100` | `#dbeafe` | Fondos hover sutiles |
| `--color-primary-500` | `#3b82f6` | Elementos secundarios de acción |
| `--color-primary-600` | `#2563eb` | Color de acción principal. Botones, links, focus rings |
| `--color-primary-700` | `#1d4ed8` | Hover de elementos primarios |
| `--color-primary-900` | `#1e3a8a` | Texto sobre fondos claros de acento |

### Colores de acento (violeta)

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-accent-500` | `#8b5cf6` | Elementos de acento secundario |
| `--color-accent-600` | `#7c3aed` | Color de acento principal. Badges de plan, elementos creativos |

### Colores neutros

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-gray-50` | `#f9fafb` | Fondo de página, backgrounds secundarios |
| `--color-gray-100` | `#f3f4f6` | Skeletons, fondos de elementos inactivos |
| `--color-gray-200` | `#e5e7eb` | Bordes, separadores |
| `--color-gray-500` | `#6b7280` | Texto de placeholder, labels secundarios |
| `--color-gray-700` | `#374151` | Texto de body |
| `--color-gray-900` | `#111827` | Texto principal, headings |

### Colores de estado semánticos

| Token | Valor | Ratio WCAG (sobre blanco) | Uso |
|-------|-------|--------------------------|-----|
| `--color-success` | `#10b981` (emerald-500) | 3.0:1 | Solo para elementos UI grandes (no texto normal) |
| `--color-warning` | `#f59e0b` (amber-500) | 2.87:1 | Solo con texto oscuro encima |
| `--color-error` | `#dc2626` (red-600) | 4.83:1 | Texto de error, alerts — pasa WCAG AA |
| `--color-info` | `#2563eb` (primary-600) | 5.16:1 | Mensajes informativos |

**Nota de corrección aplicada en Sprint 01**: `--color-error` fue corregido de `#ef4444` (red-500, 3.76:1 — falla WCAG AA para texto normal) a `#dc2626` (red-600, 4.83:1 — pasa WCAG AA).

### Colores de fondo semánticos

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-bg-primary` | `#ffffff` | Fondo principal de la aplicación |
| `--color-bg-secondary` | `#f9fafb` | Fondo de páginas, áreas secundarias |
| `--color-bg-tertiary` | `#f3f4f6` | Fondos de cards dentro de áreas secundarias |

### Tipografía

| Token | Valor |
|-------|-------|
| `--font-sans` | `'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` |
| `--font-mono` | `'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace` |
| `--text-xs` | `0.75rem` (12px) |
| `--text-sm` | `0.875rem` (14px) |
| `--text-base` | `1rem` (16px) |
| `--text-lg` | `1.125rem` (18px) |
| `--text-xl` | `1.25rem` (20px) |
| `--text-2xl` | `1.5rem` (24px) |
| `--text-3xl` | `1.875rem` (30px) |
| `--text-4xl` | `2.25rem` (36px) |
| `--font-normal` | `400` |
| `--font-medium` | `500` |
| `--font-semibold` | `600` |
| `--font-bold` | `700` |
| `--leading-tight` | `1.25` |
| `--leading-normal` | `1.5` |
| `--leading-relaxed` | `1.75` |

### Espaciado

| Token | Valor | Tailwind equivalente |
|-------|-------|---------------------|
| `--spacing-1` | `0.25rem` (4px) | `p-1`, `m-1` |
| `--spacing-2` | `0.5rem` (8px) | `p-2`, `m-2` |
| `--spacing-3` | `0.75rem` (12px) | `p-3`, `m-3` |
| `--spacing-4` | `1rem` (16px) | `p-4`, `m-4` |
| `--spacing-6` | `1.5rem` (24px) | `p-6`, `m-6` |
| `--spacing-8` | `2rem` (32px) | `p-8`, `m-8` |
| `--spacing-12` | `3rem` (48px) | `p-12`, `m-12` |
| `--spacing-16` | `4rem` (64px) | `p-16`, `m-16` |

### Border radius

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-sm` | `0.25rem` (4px) | Inputs, elementos pequeños |
| `--radius-md` | `0.375rem` (6px) | Cards, botones |
| `--radius-lg` | `0.5rem` (8px) | Modales, panels |
| `--radius-xl` | `0.75rem` (12px) | Contenedores grandes |
| `--radius-full` | `9999px` | Avatars, badges pill |

### Sombras

| Token | Valor | Uso |
|-------|-------|-----|
| `--shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Cards sutiles |
| `--shadow` | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` | Dropdowns, tooltips |
| `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | Modales, panels flotantes |
| `--shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | Builder panels |

### Transiciones

| Token | Valor | Uso |
|-------|-------|-----|
| `--transition-fast` | `150ms ease` | Hover states, micro-interacciones inmediatas |
| `--transition-normal` | `200ms ease` | Transiciones de componentes |
| `--transition-slow` | `300ms ease` | Animaciones de layout, modales |

### Z-index

| Token | Valor | Uso |
|-------|-------|-----|
| `--z-dropdown` | `1000` | Dropdowns, menús contextuales |
| `--z-sticky` | `1020` | Headers fijos |
| `--z-fixed` | `1030` | Elementos fijos (sidebars mobile) |
| `--z-modal` | `1050` | Modales y dialogs |
| `--z-toast` | `1080` | Notificaciones toast (siempre encima) |

---

## Tokens nuevos — Sprint 03

Estos tokens documentan los colores usados en las tres nuevas funcionalidades de Sprint 03. Están pendientes de añadir a `packages/ui/src/styles/tokens.css`.

### Estados de dominio personalizado

Usados en el componente `CustomDomainSection` de `settings/page.tsx`.

```css
/* Estados de dominio personalizado */
--color-domain-pending:   #F59E0B;  /* amber-400 — indicador pulse y bg del cuadro DNS */
--color-domain-active:    #10B981;  /* emerald-500 — círculo de checkmark */
--color-domain-failed:    #DC2626;  /* red-600 — alert de error (alineado con --color-error) */
--color-domain-verifying: #3B82F6;  /* blue-500 — estado de verificación en progreso */
```

**Nota de contraste**:

| Token | Texto sobre blanco | WCAG AA (4.5:1) |
|-------|-------------------|-----------------|
| `--color-domain-pending` (#F59E0B) | No usar como color de texto sobre blanco (2.87:1) | Solo fondos/indicadores decorativos con `aria-hidden` |
| `--color-domain-active` (#10B981) | No usar como texto normal (3.0:1) | Solo fondos e iconos decorativos |
| `--color-domain-failed` (#DC2626) | 4.83:1 | Pasa — alineado con `--color-error` existente |
| `--color-domain-verifying` (#3B82F6) | 3.47:1 | No usar como texto normal |

Para los estados `pending` y `active`, el color se usa en elementos decorativos con `aria-hidden="true"`. El estado semántico se comunica únicamente a través del texto adyacente (ej: "Pendiente de verificacion DNS", "Dominio activo"), que sí cumple contraste WCAG AA.

**Implementación actual en código**: Los colores se aplican directamente con clases de Tailwind (`bg-yellow-400`, `bg-green-500`) sin usar los tokens CSS definidos aquí. La migración a tokens CSS es tarea para Sprint 04.

**Colores para texto de estado** (implementados con Tailwind, alineados con los tokens):

| Estado | Clase Tailwind | Hex | Contraste sobre blanco |
|--------|---------------|-----|----------------------|
| PENDING/VERIFYING — texto | `text-yellow-700` | `#b45309` | 5.74:1 — pasa WCAG AA |
| ACTIVE — texto | `text-green-700` | `#15803d` | 5.74:1 — pasa WCAG AA |
| FAILED — texto (en Alert) | `text-red-600` | `#dc2626` | 4.83:1 — pasa WCAG AA |

---

### Tokens de Analytics

Usados en el componente `BarChart` y barras de progreso de `analytics/page.tsx`.

```css
/* Gráfico de barras de visitas */
--color-bar-primary: #2563EB;              /* blue-600 — barras principales */
--color-bar-empty:   rgba(37, 99, 235, 0.3); /* blue-600 al 30% — días sin datos (0 visitas) */
--color-bar-hover:   #1D4ED8;              /* blue-700 — hover de barra */

/* Barra de progreso de páginas más visitadas */
--color-bar-pages:   #6366F1;              /* indigo-500 — coincide con implementación actual */

/* Barra de progreso de fuentes de tráfico */
--color-bar-referrers: #8B5CF6;            /* violet-500 — coincide con implementación actual */
```

**Divergencia actual**: El código usa `bg-indigo-500` (#6366f1) para las barras del gráfico, mientras que el design system especifica `--color-bar-primary: #2563EB` (blue-600). La corrección implica cambiar la clase en `BarChart` de `bg-indigo-500` a `bg-primary-600` o al token definido aquí.

**Uso de color vacío**: El token `--color-bar-empty` aún no está implementado en el código. Actualmente, las barras de días con 0 visitas muestran `minHeight: '2px'` con el mismo color primario. La especificación correcta es opacidad reducida para comunicar "dato existente pero vacío" vs. "dato con valor".

---

### Tokens de Billing

Usados en el componente `PlanCard` de `billing/page.tsx`.

```css
/* Plan destacado */
--color-plan-highlight-border: #4F46E5;  /* indigo-600 — borde del plan Business */
--color-plan-highlight-bg:     #EEF2FF;  /* indigo-50 — fondo sutil del plan destacado */
```

**Divergencia actual**: El código usa `border-primary-600` (#2563eb, blue-600) para el borde del plan Business, mientras que el design token especifica `#4F46E5` (indigo-600). Ambos son variantes de azul/índigo. La decisión final depende de la identidad visual deseada para el plan destacado — blue-600 es más consistente con el design system existente.

**Nota**: `--color-plan-highlight-bg` no está implementado en el código actual — la card del plan popular no tiene fondo diferenciado, solo borde y sombra. Es una mejora visual para Sprint 04.

---

## Resumen de pendientes para `tokens.css`

Estas líneas deben añadirse a `packages/ui/src/styles/tokens.css` para formalizar los tokens de Sprint 03:

```css
/* Sprint 03 — Estados de dominio personalizado */
--color-domain-pending:   #F59E0B;
--color-domain-active:    #10B981;
--color-domain-failed:    #DC2626;
--color-domain-verifying: #3B82F6;

/* Sprint 03 — Analytics */
--color-bar-primary:   #2563EB;
--color-bar-empty:     rgba(37, 99, 235, 0.3);
--color-bar-hover:     #1D4ED8;
--color-bar-pages:     #6366F1;
--color-bar-referrers: #8B5CF6;

/* Sprint 03 — Billing */
--color-plan-highlight-border: #4F46E5;
--color-plan-highlight-bg:     #EEF2FF;
```

Una vez añadidos, los componentes deben migrarse de clases Tailwind hardcodeadas (`bg-indigo-500`, `border-primary-600`) a referencias a estos tokens para mantener la fuente de verdad centralizada.
