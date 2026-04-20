# Billing Toggle — Especificaciones UX

**Sprint 03 — UX Designer**
**Archivo de referencia**: `apps/admin/src/app/(tenant)/billing/page.tsx`
**Ruta**: `/billing`

---

## Contexto de la pantalla

La página de facturación es una pantalla de nivel superior del panel de administración. Tiene tres secciones principales en flujo vertical:

1. **Plan actual** — card con info del plan activo y botón "Gestionar suscripcion"
2. **Uso del plan** — barras de progreso para sitios, páginas y almacenamiento
3. **Selector de plan** — toggle mensual/anual + grid de cards de planes
4. **Historial de facturas** — tabla de facturas pasadas

El ancho máximo de la página es `max-w-5xl` con `space-y-10` entre secciones.

---

## Sección "Plan actual"

```
┌────────────────────────────────────────────────────────────┐
│  Plan actual                                               │
│  Starter                         [Gestionar suscripcion]  │
│  $0 / mes                                                  │
│  Renueva el 15 de mayo de 2026                            │
└────────────────────────────────────────────────────────────┘
```

| Elemento | Especificación |
|----------|---------------|
| Label "Plan actual" | `text-sm text-gray-500 mb-1` |
| Nombre del plan | `text-2xl font-bold text-gray-900` |
| Precio | `text-sm text-gray-500 mt-1` — "Gratis" si `priceMonthly === '0.00'`, o "$X / mes" |
| Fecha renovación | `text-xs text-gray-400 mt-1` — "Renueva el DD de MMMM de YYYY" o "Cancela el..." |
| Botón gestionar | `variant="outline" size="sm"`. Solo visible si `billing.subscription` existe (no en plan gratuito) |
| Layout | `flex items-start justify-between gap-4 flex-wrap` — adapta a mobile apilando los elementos |

El botón "Gestionar suscripcion" redirige al portal de Stripe (`/billing/portal`). Muestra spinner mientras `portalLoading === true`.

---

## Sección "Uso del plan" (UsageBar)

Tres barras de progreso para los recursos del plan:

```
Sitios                                    1 / 3
████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

Paginas                                   5 / 30
████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

Almacenamiento (GB)                       0.5 / 5
████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

| Elemento | Especificación |
|----------|---------------|
| Label | `text-sm text-gray-600` |
| Contador | `text-sm font-medium text-gray-900`. Si ilimitado: muestra "X / ∞" (`\u221e`) |
| Barra de fondo | `h-1.5 w-full rounded-full bg-gray-100` |
| Relleno normal | `bg-primary-600` (azul, #2563eb) |
| Relleno en alerta | `bg-orange-500` cuando `pct > 80` — supera el 80% de uso |
| Recursos ilimitados | No se renderiza la barra cuando `max < 0` |
| Accesibilidad | `role="progressbar" aria-valuenow={used} aria-valuemax={max} aria-label={label}` — implementado |

---

## Componente Toggle Mensual/Anual

### Mecanismo de control: Switch

La implementación usa el componente `Switch` de `@edithpress/ui` en lugar de un par de botones. Esta decisión es correcta para este caso de uso por las siguientes razones:

- Hay exactamente **dos opciones binarias** (mensual / anual), no tres o más
- El Switch comunica de forma inmediata el estado actual (on/off) sin necesidad de leer ambas opciones
- Un par de botones sería semánticamente más correcto para "elegir entre N opciones", pero con N=2 y significado claramente binario, el Switch es igualmente válido y más compacto

**Especificación del Switch**:
- `checked={interval === 'yearly'}` — está activo cuando se selecciona anual
- `onCheckedChange={(checked) => setInterval(checked ? 'yearly' : 'monthly')}`
- `aria-label="Cambiar a facturacion anual"` — el label describe la acción, no el estado actual

### Layout del toggle

```
Mensual   [○────]   Anual  [Ahorra 2 meses]
         ↑Switch            ↑Badge (solo visible en anual)
```

| Elemento | Estado mensual | Estado anual |
|----------|---------------|--------------|
| Label "Mensual" | `text-gray-900 font-medium text-sm` (activo) | `text-gray-400 font-medium text-sm` (inactivo) |
| Switch | Apagado (off) | Encendido (on) |
| Label "Anual" | `text-gray-400 font-medium text-sm` (inactivo) | `text-gray-900 font-medium text-sm` (activo) |
| Badge "Ahorra 2 meses" | Oculto (`interval !== 'yearly'`) | Visible (`variant="success" text-xs font-semibold`) |

**Decisión de diseño**: Los labels "Mensual" y "Anual" cambian de `text-gray-900` a `text-gray-400` según cuál esté activo. Esto refuerza visualmente qué opción está seleccionada sin depender solo del estado del Switch.

### Badge "Ahorra 2 meses"

- Solo se muestra cuando `interval === 'yearly'`
- `variant="success"` — fondo verde claro con texto verde oscuro
- `className="text-xs font-semibold"` — pequeño y destacado

**Micro-interacción del badge**: La implementación renderiza/desmonta el badge con una condición `&&`. No hay animación de entrada en la implementación actual. La especificación ideal es añadir `transition-opacity duration-150` con un fade-in al aparecer.

### Transición del precio al cambiar

Al cambiar el toggle, los precios en todas las cards se actualizan inmediatamente (re-render de React). No hay transición CSS de precio en la implementación actual.

**Especificación ideal para iteración futura**: El precio debería hacer un fade suave:
```css
transition: opacity 150ms ease;
/* Al cambiar: opacity 0 → 150ms → opacity 1 */
```

Esto se puede implementar con una key que cambie al cambiar `interval`, disparando el re-mount del elemento con una animación CSS.

---

## Cards de Plan (PlanCard)

### Grid de cards

```
mobile:   1 columna
md:       2 columnas  (md:grid-cols-2)
lg:       4 columnas  (lg:grid-cols-4)
gap:      gap-6
```

### Contenido y orden visual de cada card

```
┌─────────────────────────────┐
│  [MAS POPULAR]              │ ← Badge posicionado absolute -top-3
│                             │
│  BUSINESS            (nombre del plan, uppercase xs)
│  $15/mes             (precio prominente, 3xl bold)
│  $180 facturado anualmente  (solo en modo anual)
│  $216 ~~tachado~~           (precio mensual × 12, tachado)
│                             │
│  ✓ 3 sitios                 │
│  ✓ 30 paginas               │
│  ✓ 10 GB almacenamiento     │
│  ✓ Dominio personalizado    │
│  ✓ Analitica avanzada       │
│                             │
│  [Contratar Business]       │ ← CTA
└─────────────────────────────┘
```

### Detalle de cada sección

**1. Nombre del plan**
- `text-xs font-semibold uppercase tracking-wide text-gray-500`
- Los planes disponibles son definidos por la API: Starter, Business, Pro, Enterprise (inferido del código)

**2. Precio con período**
```
Modo mensual: "$15/mes"
Modo anual:   "$12/mes"  (precio anual dividido implícitamente)
Plan gratuito: "Gratis"  (sin período)
```
- Formato precio: `text-3xl font-bold text-gray-900`
- La fórmula actual muestra el precio mensual en ambos modos (mensual y anual). El priceYearly de la API ya refleja el precio mensual equivalente en facturación anual.

**3. Ahorro anual (solo en modo anual)**
- `text-xs text-green-600 font-medium`
- Fórmula: `$${(plan.priceYearly * 12).toFixed(0)} facturado anualmente` + precio original tachado `$${(plan.priceMonthly * 12).toFixed(0)}`
- Precio tachado: `text-gray-400 line-through`

**4. Lista de features con checkmark**
- Generados por `buildFeatures(plan)`: sitios, páginas, almacenamiento, dominio personalizado, analítica, e-commerce, white-label (según flags de la API)
- Cada item: `flex items-center gap-2 text-sm text-gray-700`
- Icono checkmark: SVG polyline 14×14, `text-primary-600 shrink-0`, `aria-hidden="true"`

**5. CTA button**
- Ver sección "Estados del CTA button" abajo

---

## Estados del CTA button

| Condición | Texto | Variante | Estado |
|-----------|-------|---------|--------|
| `plan.name.toLowerCase() === currentPlanSlug.toLowerCase()` | "Plan actual" | `outline` | `disabled` |
| `plan.priceMonthly === 0` (gratuito) | "Gratis" | `outline` | `disabled` |
| Plan de pago, no es el actual, plan destacado | "Contratar {nombre}" | `primary` | Activo |
| Plan de pago, no es el actual, plan no destacado | "Contratar {nombre}" | `outline` | Activo |
| Checkout en proceso (`checkoutLoadingId === plan.id`) | (spinner) | — | `loading={true}` |

**Nota importante**: El estado loading es por plan individual. Si el usuario hace clic en "Contratar Business", solo la card de Business muestra spinner. Las demás cards siguen interactivas.

**Decisión de diseño**: El texto del CTA incluye el nombre del plan ("Contratar Business") en lugar de solo "Contratar". Esto reduce el riesgo de confusión cuando el usuario confirma la selección en el checkout de Stripe.

---

## Plan destacado ("Mas popular")

El plan Business recibe tratamiento especial (`isPopular = plan.name.toLowerCase() === 'business'`):

### Diferencias visuales vs. cards normales

| Elemento | Card normal | Card Business (popular) |
|----------|-------------|------------------------|
| Borde | Sin borde especial (shadcn Card default) | `border-2 border-primary-600 shadow-md` |
| Badge | Sin badge | Badge "Mas popular" posicionado `absolute -top-3 left-1/2 -translate-x-1/2` |
| CTA | `variant="outline"` | `variant="primary"` (azul relleno) |

### Especificación del badge "Mas popular"

```
Posición: absolute -top-3, centrado horizontal (-translate-x-1/2)
Estilo:   Badge variant="primary" px-3 py-1 text-xs font-semibold
Texto:    "Mas popular"
```

El posicionamiento `absolute -top-3` requiere que la Card tenga `relative` en su className — implementado: `className="p-6 flex flex-col relative"`.

**Decisión de diseño**: El badge "Mas popular" se posiciona fuera de la card (sobresale por arriba 12px) para crear un punto de entrada visual que destaca en el grid de 4 columnas. Esta técnica es estándar en páginas de pricing SaaS.

---

## Sección de historial de facturas

```
┌────────────────────────────────────────────────────────────┐
│  Historial de facturas                                     │
│                                                            │
│  $99.00 USD                              [Pagada] [PDF]    │
│  15 de enero de 2026                                       │
│  ─────────────────────────────────────────────────────── │
│  $99.00 USD                              [Pendiente] [PDF] │
│  15 de diciembre de 2025                                   │
└────────────────────────────────────────────────────────────┘
```

| Elemento | Especificación |
|----------|---------------|
| Monto | `text-sm font-medium text-gray-900` |
| Fecha | `text-xs text-gray-400`. Formato: "DD de MMMM de YYYY" |
| Badge estado | `variant="success"` si `inv.status === 'paid'` (texto: "Pagada"), `variant="warning"` para otros estados |
| Link PDF | `text-xs text-primary-600 hover:underline`. Abre en nueva pestaña. Solo si `inv.pdfUrl` existe |
| Estado vacío | "No hay facturas aun." — `text-sm text-gray-500` |
| Separadores | `divide-y divide-gray-100` entre filas |

---

## Estado de carga (PageSkeleton)

Cuando `billingLoading === true`, se reemplaza toda la página con tres rectángulos:

```
┌─────────────────────────────────────────────────────────┐
│  [████████████████████████████████████]  h-32 animate-pulse  │
│  [████████████████████████████████████]  h-32               │
│  [████████████████████████████████████]  h-32               │
└─────────────────────────────────────────────────────────┘
```

`className="h-32 rounded-xl bg-gray-100 animate-pulse"` — tres skeletons apilados con `space-y-4`.

**Nota**: El skeleton es genérico (no tiene forma de card, toggle o grid). Una iteración futura podría usar skeletons con la forma exacta de cada sección para reducir el layout shift al cargar.

---

## Estado de error (billingError)

```
┌────────────────────────────────────────────────────────────┐
│  No se pudo cargar la informacion de facturacion.          │
│  Intenta de nuevo mas tarde.                               │
└────────────────────────────────────────────────────────────┘
```

`Alert variant="error"` — sin botón de reintento. La misma observación que en analytics: añadir `refetch()` en una iteración futura.

---

## Error de checkout (checkoutError)

Cuando el checkout falla (planId no existe, Stripe rechaza, error de red), aparece un `Alert variant="error"` dismissible en la parte superior de la página, encima de toda la UI de planes:

```
┌────────────────────────────────────────────────────────────┐
│  No se pudo iniciar el proceso de pago.              [×]   │
└────────────────────────────────────────────────────────────┘
```

- `onDismiss={() => setCheckoutError(null)}` — el usuario puede cerrar el alert
- Aparece también para errores del portal de Stripe

---

## Accesibilidad

| Elemento | Estado |
|----------|--------|
| Sección de planes con `aria-labelledby="plans-heading"` | Implementado |
| `id="plans-heading"` en el h3 "Cambia tu plan" | Implementado |
| Switch con `aria-label` | Implementado: `aria-label="Cambiar a facturacion anual"` |
| Botones "Plan actual" y "Gratis" con `disabled` | Implementado (HTML disabled nativo) |
| Barras de uso con `role="progressbar"` | Implementado en UsageBar |
| Checkmark en features con `aria-hidden` | Implementado |
| Link PDF con texto visible | Implementado: texto "PDF" visible |

### Notas de mejora recomendadas

1. **Precio y transición**: Al cambiar el toggle, el precio cambia instantáneamente. Para lectores de pantalla, sería beneficioso añadir un `aria-live="polite"` en la región del precio de cada card para que se anuncie el nuevo valor.

2. **Toggle como radio group**: Semánticamente, un par `Mensual / Anual` podría implementarse como `role="radiogroup"` con dos `role="radio"`. El Switch actual con `aria-label` es funcional pero no comunica el estado como par de opciones mutuamente excluyentes. Evaluable para Sprint 04.

3. **Badge "Mas popular" en aria**: El badge está dentro de la Card pero fuera del flujo visual. Los lectores de pantalla lo leerán en orden DOM, antes del nombre del plan. Añadir `aria-label` a la card completa o un `<span className="sr-only">Plan mas popular: </span>` antes del nombre del plan asegura el anuncio correcto.
