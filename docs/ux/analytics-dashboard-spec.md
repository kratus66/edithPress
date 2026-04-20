# Analytics Dashboard — Especificaciones UX

**Sprint 03 — UX Designer**
**Archivo de referencia**: `apps/admin/src/app/(tenant)/sites/[siteId]/analytics/page.tsx`
**Ruta**: `/sites/[siteId]/analytics`

---

## Contexto de la pantalla

El dashboard de analítica es una sub-página del sitio, accesible desde las tabs de configuración. Comparte navegación con la pestaña "General & SEO" (`/sites/[siteId]/settings`). El estado de la pantalla depende completamente de una sola query (`['site-analytics', siteId, period]`) que se recarga al cambiar el selector de período.

La query tiene `staleTime: 5 * 60 * 1000` (5 minutos) — los datos no se actualizan en tiempo real, se consideran frescos durante 5 minutos.

---

## Layout y jerarquía visual

### Estructura de la página

```
┌──────────────────────────────────────────────────────────────────┐
│  ← Sitio    Analitica                    [7 dias][30 dias][90 dias]│
├──────────────────────────────────────────────────────────────────┤
│  [General & SEO]  [Analitica ←activo]                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐               │
│  │  Total de visitas   │  │  Paginas unicas      │               │
│  │  1,234              │  │  56                  │               │
│  └─────────────────────┘  └─────────────────────┘               │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Visitas por dia                                           │  │
│  │  █ █   █ █ █       █ █ █ █   █  (barras CSS)             │  │
│  │  1  2  3  4  5  6  7  8  9  10  (eje X)                  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────┐  ┌──────────────────────────┐      │
│  │  Paginas mas visitadas   │  │  Fuentes de trafico      │      │
│  │  /          400  (32%)  │  │  google.com         300   │      │
│  │  ████████████████       │  │  ████████████████         │      │
│  │  /blog      200  (16%)  │  │  Directo            200   │      │
│  │  ████████              │  │  ████████                  │      │
│  │  ...                   │  │  ...                        │      │
│  └──────────────────────────┘  └──────────────────────────┘      │
└──────────────────────────────────────────────────────────────────┘
```

**Ancho máximo**: `max-w-5xl` con `space-y-6` entre secciones.

**Responsive**:
- Cards de métricas: `grid gap-4 sm:grid-cols-2` — apiladas en mobile, lado a lado en sm+
- Tablas inferiores: `grid gap-6 md:grid-cols-2` — apiladas hasta md, lado a lado en md+

---

## Header y selector de período

### Componentes del header

| Elemento | Implementación | Comportamiento |
|----------|---------------|----------------|
| Botón "Volver al sitio" | Link con ícono chevron izquierdo + texto "Sitio" | Navega a `/sites/[siteId]`. `aria-label="Volver al sitio"` |
| Título de sección | `h2 text-xl font-semibold text-gray-900` | Texto fijo "Analitica" |
| Selector de período | Grupo de botones segmentados | Ver especificación abajo |

### Selector de período — especificación de interacción

El selector es un grupo de tres botones (`role="group" aria-label="Seleccionar periodo"`) que funcionan como radio buttons visuales:

```
Opciones: [7 dias] [30 dias] [90 dias]
Default:  30 dias
```

**Estado activo**: `bg-primary-600 text-white` (#2563eb con texto blanco — ratio 5.16:1, pasa WCAG AA).
**Estado inactivo**: `bg-white text-gray-600 hover:bg-gray-50`.
**Atributo**: `aria-pressed={period === p.value}` en cada botón.
**Contenedor**: `rounded-lg border border-gray-200 overflow-hidden` — borde único alrededor del grupo, no por botón.

**Decisión de diseño**: Se usaron botones segmentados (no un `<select>`) porque hay solo 3 opciones, siempre visibles, y el cambio es frecuente durante la exploración de datos. El `select` crearía fricción innecesaria con el click adicional para abrirlo.

---

## Cards de métricas (SummaryCards)

Dos cards en grilla 2 columnas:

| Card | Métrica | Fuente de datos |
|------|---------|----------------|
| "Total de visitas" | `analytics.totalViews` | Suma de todas las vistas del período |
| "Paginas unicas visitadas" | `analytics.uniquePaths` | Cantidad de paths distintos con al menos 1 vista |

**Formato del número**: `toLocaleString('es-ES')` — usa separador de miles por punto (ej: "1.234").

**Tipografía del valor**: `text-3xl font-bold text-gray-900` — número grande y prominente.

**Estado de carga**: Skeleton `h-8 w-24` con `animate-pulse bg-gray-100` reemplaza el número. El label de la card siempre es visible durante la carga.

---

## Gráfico de barras CSS (BarChart)

### Datos y escala

- **Eje Y**: Relativo. La barra más alta siempre es 100% de altura. Fórmula: `heightPct = (d.count / maxCount) * 100`. `maxCount = Math.max(...data.map(d => d.count), 1)` — el mínimo es 1 para evitar división por cero.
- **Altura del contenedor**: Fijo en `h-40` (160px). Las barras llenan este espacio proporcionalmente.
- **Altura mínima de barra**: `minHeight: '2px'` — los días con 0 visitas tienen una barra visible mínima para indicar que el dato existe.
- **Color de barra**: `bg-indigo-500` en implementación actual. Ver nota de divergencia con design tokens abajo.

### Etiquetas del eje X

| Período | Intervalo de etiquetas | Formato |
|---------|------------------------|---------|
| 7d | Cada día (i % 1 === 0) | "1 ene", "2 ene"... (día + mes corto) |
| 30d | Cada 5 días (i % 5 === 0) | "1 ene", "6 ene"... |
| 90d | Cada 7 días (i % 7 === 0) | "1 ene", "8 ene"... |

**Implementación**: `new Date(d.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })`.
**Estilo de etiqueta**: `text-[9px] text-gray-400` — tamaño muy pequeño para no saturar el eje. Las etiquetas tienen `aria-hidden="true"` (el gráfico completo tiene su propio `aria-label`).

### Tooltip al hover

```
┌─────────────┐
│  234 visitas │
│  15 ene      │
└──────┬──────┘
       ▼
  [barra]
```

| Elemento | Especificación |
|----------|---------------|
| Disparador | Clase `group` en el contenedor de la barra. `group-hover:flex` muestra el tooltip |
| Posición | `absolute bottom-full mb-1 left-1/2 -translate-x-1/2` — centrado sobre la barra |
| Contenido | Número de visitas en `font-medium`, fecha en `text-gray-300` debajo |
| Fondo | `bg-gray-900 text-white rounded px-2 py-1 text-xs` |
| Flecha | Pseudo-elemento: `div h-1.5 w-1.5 rotate-45 bg-gray-900` sobrepuesto |
| Accesibilidad | `aria-hidden="true"` — la información del tooltip está en el `aria-label` de la barra |

Cada barra tiene `aria-label="{d.date}: {d.count} visitas"` para lectores de pantalla.

### Rol del gráfico completo

```html
<div role="img" aria-label="Grafico de barras: visitas por dia">
```

Este elemento envuelve todo el gráfico. Los lectores de pantalla lo anuncian como una imagen con descripción.

**Nota de divergencia**: El color de la barra en implementación es `bg-indigo-500` (#6366f1), no `--color-bar-primary: #2563EB` (blue-600) del design system. Ver sección de design tokens para la especificación correcta. La corrección es candidata para Sprint 04.

---

## Tabla "Páginas más visitadas" (TopPagesTable)

### Columnas

| Columna | Fuente | Formato |
|---------|--------|---------|
| Página (path) | `page.path` | `font-mono text-xs text-gray-700`. Path "/" se muestra como "/" — ver nota |
| Visitas | `page.count` | `text-sm font-medium text-gray-900` con `toLocaleString('es-ES')` |
| % del total | `(page.count / totalViews) * 100` redondeado | `text-xs font-normal text-gray-400`, entre paréntesis junto a visitas |

**Decisión de diseño sobre path "/"**: La implementación actual muestra el path "/" literal. La especificación ideal es mostrar "Inicio" como label display, conservando "/" en el dato subyacente. Pendiente de implementar.

### Barra de progreso inline

Debajo de cada fila aparece una barra de 1px de altura:

- **Fondo**: `h-1 w-full rounded-full bg-gray-100`
- **Relleno**: `h-1 rounded-full bg-indigo-500`
- **Cálculo**: `barPct = (page.count / max) * 100` donde `max` es el count de la página más visitada (no el total de visitas). La primera fila siempre tiene la barra al 100%.

**Límite de filas**: `pages.slice(0, 10)` — máximo 10 páginas mostradas.

**Estado vacío**: Texto centrado `text-sm text-gray-400 py-4`: "Sin datos de paginas aun."

**Nota de accesibilidad**: La barra de progreso inline no tiene `role="progressbar"` ni `aria-valuenow` en la implementación actual. Añadirlos en iteración futura para que lectores de pantalla puedan comunicar la proporción relativa.

---

## Tabla "Fuentes de tráfico" (ReferrersTable)

### Columnas

| Columna | Fuente | Formato |
|---------|--------|---------|
| Fuente | `ref.referrer || 'Directo'` | `text-sm text-gray-700` — nulos se muestran como "Directo" |
| Visitas | `ref.count` | `text-sm font-medium text-gray-900` |

**Barra de progreso inline**: Misma especificación que TopPagesTable, pero con `bg-violet-500` (#8b5cf6) para diferenciar visualmente las dos tablas.

**Límite**: `referrers.slice(0, 10)` — máximo 10 fuentes.

**Estado vacío**: "Sin datos de fuentes de trafico aun." — mismo estilo que TopPagesTable.

**Decisión de diseño**: El color violeta para fuentes de tráfico (`bg-violet-500`) contrasta con el azul/índigo de páginas, permitiendo identificar rápidamente a qué tabla pertenece cada métrica sin leer el header. Es consistente con `--color-accent-600` del design system.

---

## Estados de la pantalla

### Estado 1 — Loading (carga inicial)

Se activa cuando `isLoading === true`. La pantalla muestra skeletons por sección:

| Sección | Skeleton |
|---------|---------|
| Cards de métricas | `Skeleton className="mt-2 h-8 w-24"` dentro de cada card (el label siempre visible) |
| Gráfico de barras | N barras con altura aleatoria `bg-gray-100 animate-pulse` (7, 30 o 20 barras según período) |
| Tablas | 5 filas de `Skeleton className="h-10 w-full"` (páginas) y `h-9 w-full"` (fuentes) |

**Nota**: El header, el selector de período y los tabs de navegación siempre se muestran — no tienen loading state, lo que permite que el usuario cambie período aunque los datos anteriores estén cargando.

### Estado 2 — Empty (primer día sin datos)

**Condición**: `!isLoading && !isError && analytics.totalViews === 0 && analytics.viewsByDay.length === 0`

**Cuando los datos cargaron pero el total es cero**, se ocultan todas las secciones de datos y se muestra una sola Card centrada:

```
┌────────────────────────────────────────────────────┐
│                                                    │
│              [icono ojo]                           │
│          Sin datos aun                             │
│  Las visitas apareceran aqui cuando tu sitio       │
│  reciba trafico.                                   │
│                                                    │
└────────────────────────────────────────────────────┘
```

| Elemento | Especificación |
|----------|---------------|
| Icono | SVG de ojo (path + circle). `h-12 w-12 text-gray-400`. Fondo: `rounded-full bg-gray-100 flex items-center justify-center` |
| Título | "Sin datos aun" — `text-sm font-medium text-gray-900` |
| Subtítulo | "Las visitas apareceran aqui cuando tu sitio reciba trafico." — `text-sm text-gray-500 mt-1` |
| Padding | `p-12 text-center` |

**Nota de copywriting**: El empty state no menciona qué hacer para obtener datos (publicar el sitio, compartir la URL). Una iteración futura podría añadir un CTA: "Asegúrate de que tu sitio esté publicado" con link al sitio.

### Estado 3 — Populated (datos normales)

Todo se muestra según especificación de cada sección. No hay estado especial.

### Estado 4 — Error (fallo de API)

**Condición**: `isError === true`

```
┌────────────────────────────────────────────────────┐
│  No se pudieron cargar los datos de analitica.     │
│  Intenta de nuevo mas tarde.                       │
└────────────────────────────────────────────────────┘
```

Implementado como `Alert variant="error"`. No hay botón de reintento en la implementación actual — el usuario debe cambiar el selector de período o recargar la página para disparar un nuevo fetch.

**Mejora recomendada**: Añadir un botón "Reintentar" que llame a `refetch()` de la query. Esto evita que el usuario tenga que recargar toda la página.

---

## Accesibilidad

| Elemento | Implementación actual | Estado |
|----------|----------------------|--------|
| Gráfico con `role="img"` | `role="img" aria-label="Grafico de barras: visitas por dia"` | Implementado |
| Barras individuales con `aria-label` | `aria-label="{date}: {count} visitas"` | Implementado |
| Selector de período con `aria-pressed` | `aria-pressed={period === p.value}` | Implementado |
| Selector de período con `role="group"` | `role="group" aria-label="Seleccionar periodo"` | Implementado |
| Tooltips `aria-hidden` | `aria-hidden="true"` en el tooltip DOM | Implementado |
| Tablas sin `<caption>` | No existe en implementación actual | Pendiente |
| Barras de progreso sin `role` | Sin `role="progressbar"` ni `aria-valuenow` | Pendiente |
| `<h3>` para títulos de sección | `h3 text-base font-semibold` en cada card | Implementado |

### Notas de mejora recomendadas

1. **Tablas sin estructura semántica**: Las "tablas" de páginas y fuentes de tráfico son actualmente listas de `div` con `divide-y`. No son `<table>` con `<th>`, `<td>` y `<caption>`. Para WCAG 2.1 criterio 1.3.1 (Info and Relationships), los datos tabulares deben usar marcado de tabla. Pendiente de refactorizar.

2. **Gráfico y datos alternativos**: `role="img"` con `aria-label` es un enfoque válido. Una mejora adicional sería ofrecer los mismos datos en formato de tabla oculta para lectores de pantalla (`<table className="sr-only">`).

3. **Anuncio al cambiar período**: Al seleccionar un período diferente, la pantalla recarga los datos pero no hay anuncio para lectores de pantalla. Añadir una región `aria-live="polite"` que anuncie "Cargando datos para los últimos 30 días..." mejora la experiencia.
