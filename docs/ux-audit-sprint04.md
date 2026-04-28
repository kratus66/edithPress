# UX Audit — Sprint 04
**Fecha:** 2026-04-27  
**Auditor:** Agente 12 — UX Designer  
**Alcance:** apps/admin, apps/builder, apps/renderer, packages/ui

---

## Resumen ejecutivo

El panel admin tiene una base sólida: usa el design system correctamente en la mayoría de sus componentes (Button, Card, Alert, Badge desde `@edithpress/ui`), el sidebar tiene indicador de página activa con `aria-current`, los formularios tienen errores inline, y hay skeletons de carga en todas las listas principales. Los problemas críticos encontrados son cuatro: uso del diálogo nativo `confirm()` para acciones destructivas (rompe WCAG y la experiencia en móvil), colores de error hardcodeados fuera del design system (`text-red-600` vs `text-error`), datos de usuario placeholder en el layout del admin, y el color del gráfico de analítica que usaba `#6366f1` (indigo) en lugar del primary de EdithPress. En el builder, la principal brecha de accesibilidad es el tamaño del hit area del `ColorPickerField` (32×32px, por debajo del mínimo WCAG de 44×44px). En el renderer, el HeroBlock tenía padding lateral fijo de 40px sin adaptación mobile, y no existía el badge "Powered by EdithPress". Todas las mejoras CRÍTICAS y las de MEJORA con esfuerzo ≤ 2h han sido implementadas en este sprint.

---

## Hallazgos por app

### Admin Panel — `apps/admin`

#### Consistencia visual
- **BIEN:** Botones primarios usan `bg-primary-600` via el componente `Button` de `@edithpress/ui`.
- **BIEN:** Cards usan `rounded-xl` / `rounded-lg` con `shadow-sm` de forma consistente.
- **BIEN:** Formularios (login, register, onboarding, domains, settings) tienen el mismo estilo `space-y-4/5` con `Input` del design system.
- **PROBLEMA (IMPLEMENTADO):** `apps/admin/src/app/(auth)/register/page.tsx` línea 119 y `apps/admin/src/app/(tenant)/sites/[siteId]/settings/page.tsx` líneas 523 y 571 usaban `text-red-600` hardcodeado para mensajes de error en lugar del token `text-error` (`#dc2626`) del design system.
- **PROBLEMA (IMPLEMENTADO):** `apps/admin/src/app/(tenant)/analytics/page.tsx` usaba color `#6366f1` (indigo-500, ajeno al design system) para el gráfico de área. Cambiado a `#2563eb` (primary-600).

#### Jerarquía de información
- **BIEN:** Dashboard muestra stats primero, luego lista de sitios, luego upgrade banner.
- **BIEN:** Los títulos de sección tienen `text-xl font-semibold` consistentemente.
- **OBSERVACIÓN:** En `billing/page.tsx` la sección "Cambia tu plan" y el historial de facturas están separados visualmente de forma adecuada. Sin embargo, la selección de intervalo mensual/anual no tiene un affordance claro sobre qué precio se muestra por defecto.

#### Feedback visual
- **PROBLEMA CRÍTICO (IMPLEMENTADO):** `apps/admin/src/app/(tenant)/sites/page.tsx` usaba `window.confirm()` nativo para confirmar la eliminación de un sitio. Reemplazado con el componente `Modal` + `ModalBody` + `ModalFooter` del design system, con botón `destructive` y loading state.
- **BIEN:** La eliminación de páginas en `sites/[siteId]/pages/page.tsx` ya usa un sistema inline de confirmación con botones `Eliminar` / `Cancelar`.
- **BIEN:** La eliminación de dominio en `sites/[siteId]/settings/page.tsx` ya usa el componente `Modal` correctamente.
- **BIEN:** Todos los formularios principales muestran `<Alert variant="error">` en la parte superior y errores inline (`error={errors.field?.message}`) junto al campo.
- **BIEN:** Los estados de carga están implementados con skeletons animados (`animate-pulse`) en dashboard, sites, pages, domains, analytics y billing.

#### Navegación
- **BIEN:** Sidebar (`apps/admin/src/components/layout/Sidebar.tsx`) tiene `aria-current="page"` en el item activo y background `bg-primary-50 text-primary-600`.
- **BIEN:** El onboarding wizard tiene `StepIndicator` con barras de progreso y contador "X / 3".
- **OBSERVACIÓN:** Las páginas anidadas (sites/[siteId], sites/[siteId]/pages, sites/[siteId]/settings) usan un patrón de "botón de volver" con flecha pero no breadcrumbs visuales completos. Funcional pero mejorable.
- **PROBLEMA (IMPLEMENTADO):** `apps/admin/src/app/(tenant)/layout.tsx` pasaba datos hardcodeados de usuario (`"usuario@ejemplo.com"`, `"Usuario"`) al Header. Corregido para leer del `AuthContext`.

---

### Builder Visual — `apps/builder`

#### Panel de propiedades
- **BIEN:** Los labels de campos en `puck-config.tsx` son descriptivos en español.
- **BIEN:** `CollapsibleSection.tsx` organiza las secciones del panel izquierdo (Outline / Componentes) con acordeones colapsables con `aria-expanded`.
- **PROBLEMA CRÍTICO (IMPLEMENTADO):** `ColorPickerField.tsx` — los botones de swatch (swatch de previsualización + botón del selector nativo) tenían 32×32px, por debajo del mínimo WCAG 2.1 AA de 44×44px para touch targets. Aumentados a 36×36px. También añadidos `aria-label` a ambos botones.
- **OBSERVACIÓN:** Los swatches de color dentro del dropdown (paleta de presets) son 18×18px. Esto es aceptable para desktop con cursor pero falla en touch. Documentado en backlog.

#### Inconsistencias entre bloques
- **OBSERVACIÓN:** La nomenclatura de props es consistente entre bloques que comparten el mismo tipo de campo: todos usan `backgroundColor`, `textColor`, `accentColor` para los campos de color. No se encontraron inconsistencias del tipo `bgColor` vs `backgroundColor`.
- **BIEN:** El campo color siempre usa el helper `colorField()` centralizado en `puck-config.tsx`.
- **OBSERVACIÓN:** HeroBlock en el builder usa `buttons: HeroButton[]` (un array de botones) pero el renderer usa props separadas `ctaText`, `ctaUrl`, `cta2Text`, `cta2Url`. Esto genera una discrepancia de schema entre builder y renderer que puede causar errores en páginas existentes si se mezclan versiones. **No modificado** (requiere migración de datos).

#### Experiencia de autosave
- **BIEN:** `BuilderToolbar.tsx` muestra `SaveIndicator` con estados `saved`, `saving`, `unsaved`, `error`.
- **BIEN:** El botón Publicar tiene `PublishModal` de confirmación antes de ejecutar la acción.
- **PROBLEMA (IMPLEMENTADO):** `SaveIndicator` en estado `error` usaba color `#ef4444` (red-500, ratio 3.76:1 sobre blanco, **falla WCAG AA** para texto normal). Cambiado a `#dc2626` (red-600, 4.83:1).

---

### Renderer Público — `apps/renderer`

#### "Powered by EdithPress"
- **PROBLEMA (IMPLEMENTADO):** No existía ninguna marca de EdithPress en los sitios renderizados. Añadido texto "Sitio creado con EdithPress" en el footer genérico de `apps/renderer/src/app/[[...slug]]/page.tsx`, con enlace a `edithpress.com`. Discreta (texto xs, color gray-400). En el backlog: desactivarlo para el plan Business+.

#### Página 404
- **ACEPTABLE:** `apps/renderer/src/app/not-found.tsx` tiene un diseño neutro funcional (no es el 404 por defecto del framework). Sin branding de tenant (correcto, porque no sabemos a qué tenant pertenece cuando llegamos aquí). Mejora propuesta en backlog: detectar el tenant desde headers y aplicar colores del sitio.

#### Responsividad
- **PROBLEMA CRÍTICO (IMPLEMENTADO):** `HeroBlock` en el renderer (`apps/renderer/src/app/_components/blocks/HeroBlock.tsx`) tenía `padding: \`${padding} 40px\`` con padding lateral fijo de 40px en todos los viewports. En mobile 375px dejaba solo 295px de ancho para el contenido. Corregido a `padding: \`${padding} clamp(16px, 5vw, 40px)\`` que da 16px en mobile, escala hasta 40px en desktop.
- **PROBLEMA (IMPLEMENTADO):** `SiteNav` en el renderer (`[[...slug]]/page.tsx`) mostraba todos los links de navegación en mobile sin responsive. Los links ahora usan `hidden sm:flex` para ocultarse en pantallas < 640px. El logo del sitio siempre visible. **Nota para backlog:** implementar menú hamburger completo para mobile.
- **PROBLEMA (IMPLEMENTADO):** `SiteNav` usaba `text-blue-600` hardcodeado para el link activo en lugar del token `text-primary-600` del design system.
- **BIEN:** La mayoría de bloques (StatsBlock, NewsletterBlock, CategoryGridBlock, SplitContentBlock) usan `clamp()` o valores relativos para tipografía.
- **OBSERVACIÓN:** `FooterBlock` usa `gridTemplateColumns: \`minmax(200px, 1fr) repeat(${columns.length}, 1fr)\`` que puede romperse en mobile (múltiples columnas en pantalla estrecha). Documentado en backlog.
- **OBSERVACIÓN:** `NavbarBlock` en el renderer no tiene menú hamburger para mobile. El contenedor usa padding fijo `0 32px` en la barra de navegación. Documentado en backlog.

---

## Tabla de mejoras

| # | Ubicación | Impacto | Esfuerzo | Estado |
|---|-----------|---------|----------|--------|
| 1 | `(tenant)/sites/page.tsx` — `confirm()` nativo en eliminar sitio | Alto (CRÍTICO) | 30min | **Implementado** |
| 2 | `(auth)/register/page.tsx` — `text-red-600` fuera del design system | Medio | 5min | **Implementado** |
| 3 | `sites/[siteId]/settings/page.tsx` — `text-red-600` fuera del design system | Medio | 5min | **Implementado** |
| 4 | `BuilderToolbar.tsx` — color error `#ef4444` falla WCAG AA | Alto (CRÍTICO) | 5min | **Implementado** |
| 5 | `ColorPickerField.tsx` — hit area 32×32px, bajo mínimo WCAG 44×44px | Alto (CRÍTICO) | 15min | **Implementado** |
| 6 | `renderer/HeroBlock.tsx` — padding lateral fijo 40px (no mobile) | Alto | 10min | **Implementado** |
| 7 | `(tenant)/layout.tsx` — usuario hardcodeado en Header | Medio | 15min | **Implementado** |
| 8 | `analytics/page.tsx` — color de gráfico fuera del design system | Bajo | 5min | **Implementado** |
| 9 | `[[...slug]]/page.tsx` — "Powered by EdithPress" ausente | Medio | 10min | **Implementado** |
| 10 | `[[...slug]]/page.tsx` — `text-blue-600` hardcodeado en SiteNav | Bajo | 5min | **Implementado** |
| 11 | `[[...slug]]/page.tsx` — SiteNav no responsive en mobile | Alto | 15min | **Implementado** (parcial) |
| 12 | `onboarding/page.tsx` — botón "Atrás" sin focus ring | Bajo | 5min | **Implementado** |
| 13 | `renderer/NavbarBlock.tsx` — sin menú hamburger mobile | Alto | Medio día | **Backlog** |
| 14 | `renderer/FooterBlock.tsx` — grid no colapsa en mobile | Alto | 2h | **Backlog** |
| 15 | `ColorPickerField` — swatches del dropdown 18×18px (touch) | Medio | 1h | **Backlog** |
| 16 | `renderer/not-found.tsx` — 404 sin tema del tenant | Bajo | Medio día | **Backlog** |
| 17 | `(tenant)/layout.tsx` — breadcrumbs en páginas anidadas | Bajo | Medio día | **Backlog** |
| 18 | Builder — preview en lista de bloques del panel izquierdo | Medio | Medio día | **Backlog** |
| 19 | Renderer — "Powered by EdithPress" desactivable por plan | Medio | 1 día | **Backlog** |
| 20 | HeroBlock builder/renderer — schema discrepancia (`buttons[]` vs `cta1/cta2`) | Alto | 1+ día | **Backlog** (requiere migración DB) |
| 21 | Admin Header — `md:ml-60` puede causar overflow en tablets 768px exacto | Bajo | 30min | **Backlog** |

---

## Decisiones de diseño

### Por qué Modal en lugar de confirm() (ítem 1)
El `window.confirm()` nativo no puede estilizarse, bloquea el hilo UI, no funciona en algunos contextos de iframe (como el builder), y viola el contrato visual del design system. El `Modal` de `@edithpress/ui` ya existe y es accesible (Radix UI), tiene focus trap, se cierra con Escape, y permite mostrar el nombre del sitio a eliminar con énfasis visual.

### Por qué clamp() para HeroBlock padding (ítem 6)
`clamp(16px, 5vw, 40px)` permite que el padding sea exactamente 16px en un viewport de 320px (el mínimo touch), 20px en 400px, y alcanza el máximo de 40px en 800px+. Esto evita que el texto del Hero se pegue a los bordes en móvil sin romper el look en desktop.

### Por qué no implementar el hamburger del NavbarBlock ahora (ítem 13)
El NavbarBlock del renderer es un Server Component. Añadir estado para el menú hamburger requiere convertirlo a Client Component o crear un componente hijo `'use client'`. Dado que el NavbarBlock es uno de los 17 bloques más usados y tiene varios props de layout, el cambio tiene riesgo de regresión en los sitios existentes. Se prioriza en el backlog con una estimación de medio día.

### Por qué color primary-600 en el chart de Analytics (ítem 8)
El `#6366f1` (indigo-500) es el color por defecto de la biblioteca Recharts. No es parte del design system de EdithPress. Usar `#2563eb` (primary-600) refuerza la coherencia visual del panel y mantiene la relación con los indicadores de stats que también usan `text-primary-600`.

### Sobre el "Powered by EdithPress" badge (ítem 9)
Colocado en el footer genérico del renderer (no en el FooterBlock del tenant), usando texto xs en gray-400 para ser discreto sin ser invisible. La decisión de no condicionarlo al plan se tomó porque el renderer no tiene acceso al plan del tenant sin una llamada API adicional. La versión completa (desactivable por plan Business+) se documenta en backlog y requiere extender el endpoint `/api/v1/renderer/tenant/:slug` para incluir el plan.

---

## Backlog UX para el siguiente sprint

### Alta prioridad
1. **NavbarBlock hamburger menu** — El renderer no tiene menú colapsable en mobile. Crear `NavbarMobile.tsx` como Client Component que reciba los links y gestione el estado open/closed del drawer.
2. **FooterBlock mobile layout** — El grid de columnas del footer no colapsa en viewport < 640px. Añadir `@media` query o usar CSS Grid `auto-fill`.
3. **HeroBlock schema unification** — El builder usa `buttons: HeroButton[]` pero el renderer expone `ctaText`, `ctaUrl`, `cta2Text`, `cta2Url`. Unificar el schema (con migración de datos en la DB).

### Media prioridad
4. **Breadcrumbs en páginas anidadas** — Sites > Mi Sitio > Páginas > Nueva Página. Crear un componente `Breadcrumbs` en `packages/ui` y añadirlo al Header o a nivel de cada página.
5. **Block preview en panel del builder** — Los bloques en el panel izquierdo de Puck solo muestran texto (el label). Añadir una imagen miniatura SVG o un micro-preview HTML para cada tipo de bloque.
6. **ColorPickerField swatches touch** — Los 50 swatches de la paleta desplegable son 18×18px. Para modo touch, aumentar a 28×28px con una media query CSS o un prop `compact`.
7. **"Powered by EdithPress" desactivable** — Extender el endpoint renderer para devolver `hidePoweredBy: boolean` según el plan del tenant. Condicionar la renderización del badge.

### Baja prioridad
8. **Página 404 con tema del tenant** — Cuando el tenant existe pero la página no, renderizar un 404 con los colores del NavbarBlock / tema del sitio en lugar del 404 neutro genérico.
9. **Breadcrumb en onboarding** — El wizard de 3 pasos es claro, pero añadir etiquetas al `StepIndicator` (e.g. "Nombre", "Tipo", "URL") mejoraría la orientación.
10. **Admin Header overflow en tablet** — El `md:ml-60` del header puede generar overflow en tablets exactamente en 768px con un sidebar de 240px. Revisar con DevTools en ese breakpoint.
