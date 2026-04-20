# Custom Domain Flow — Especificaciones UX

**Sprint 03 — UX Designer**
**Archivo de referencia**: `apps/admin/src/app/(tenant)/sites/[siteId]/settings/page.tsx`
**Componente**: `CustomDomainSection`

---

## Contexto del flujo

La sección "Dominio personalizado" aparece al final de la página de configuración del sitio (`/sites/[siteId]/settings`), dentro de una `Card` independiente. Es una sección de estado: el componente detecta el estado actual desde la API y renderiza el UI correspondiente. El estado inicial del polyfill es `NONE` mientras carga.

El tipo `DomainStatus` define 5 valores: `'NONE' | 'PENDING' | 'VERIFYING' | 'ACTIVE' | 'FAILED'`.

---

## Estados del flujo

### Estado 1 — NONE (sin dominio conectado)

**Cuándo aparece**: El sitio no tiene ningún dominio personalizado registrado. Es el estado por defecto para cuentas nuevas.

**Elementos visuales**:

```
┌─────────────────────────────────────────────────────────┐
│ Dominio personalizado                                   │
│                                                         │
│  [tu-dominio.com________________]  [Conectar dominio]   │
│                                                         │
│  Ingresa tu dominio sin http:// (ej: miempresa.com)     │
└─────────────────────────────────────────────────────────┘
```

| Elemento | Especificación |
|----------|---------------|
| Input | `type="text"`, `placeholder="tu-dominio.com"`, `aria-label="Dominio personalizado"` |
| Helper text | "Ingresa tu dominio sin http:// (ej: `miempresa.com`)" — texto 12px, `text-gray-500` |
| Botón | `variant="primary"`, label "Conectar dominio", `type="submit"` |
| Layout | `flex gap-2`: input ocupa `flex-1`, botón anchura fija |
| Error inline | Aparece debajo del input si el formato es inválido (zod: dominio sin http://, sin espacios, con punto) |

**Validaciones del formulario** (implementadas con zod):
- Campo obligatorio
- Formato: debe contener al menos un punto, sin barras ni espacios
- No puede empezar con `http`
- Mensaje de error: "Ingresa un dominio válido (ej: tu-dominio.com, sin http://)"

**Decisión de diseño**: El helper text usa un ejemplo con `font-mono` inline para que el usuario entienda el formato esperado antes de ver un error. Esto reduce el ciclo error/corrección.

---

### Estado 2 — PENDING (esperando verificación DNS)

**Cuándo aparece**: El usuario acaba de agregar el dominio. La API ha generado el registro TXT pero aún no se ha detectado en los servidores DNS.

**Elementos visuales**:

```
┌─────────────────────────────────────────────────────────┐
│ Dominio personalizado                                   │
│                                                         │
│  ● Pendiente de verificacion DNS                        │
│    (● = punto amarillo animado con pulse)               │
│                                                         │
│  Dominio: miempresa.com                                 │
│                                                         │
│  ┌── Agrega el siguiente registro DNS: ───────────────┐ │
│  │ Tipo    Nombre                    Valor            │ │
│  │ ─────── ──────────────────────── ──────────────── │ │
│  │ TXT     _edithpress-verify.       edithpress-      │ │
│  │         miempresa.com             verify=abc123    │ │
│  │                                                    │ │
│  │  [Copiar valor]                                    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                         │
│  Los cambios de DNS pueden tardar hasta 48 horas en     │
│  propagarse. Verificamos automáticamente cada 30s.      │
│                                                         │
│  [Verificar ahora]                                      │
└─────────────────────────────────────────────────────────┘
```

| Elemento | Especificación |
|----------|---------------|
| Indicador de estado | Punto `h-2 w-2 rounded-full bg-yellow-400 animate-pulse` + label "Pendiente de verificacion DNS" en `text-yellow-700 font-medium text-sm` |
| Contenedor DNS | `rounded-lg border border-yellow-200 bg-yellow-50 p-4` |
| Tabla DNS | Columnas: Tipo / Nombre / Valor. Celdas en `font-mono text-xs text-gray-700`. Sin `<caption>` en implementación actual (ver nota de accesibilidad) |
| Botón "Copiar valor" | `variant="outline" size="sm"`. Estado inicial: "Copiar valor". Tras clic: cambia a "Copiado!" por 2 segundos, luego regresa. Sin icono adicional en implementación actual |
| Helper text inferior | 12px, `text-gray-500` |
| Botón "Verificar ahora" | `variant="outline"`, con spinner si `verifyMutation.isPending` |

**Polling automático**: La query se reconfigura con `refetchInterval: 30_000` cuando `status === 'PENDING' || status === 'VERIFYING'`. El usuario no necesita interactuar para que se actualice.

---

### Estado 3 — VERIFYING (verificación en proceso)

**Cuándo aparece**: El usuario pulsó "Verificar ahora" y la petición está pendiente, o el polling detectó un intento de verificación en curso.

**Elementos visuales**: Comparte exactamente el mismo UI que PENDING. La distinción existe en el tipo de datos pero no hay diferencia visual entre ambos estados. El botón "Verificar ahora" muestra spinner mientras `verifyMutation.isPending === true`.

**Decisión de diseño**: Unificar PENDING y VERIFYING en el mismo UI reduce complejidad visual. El usuario necesita hacer la misma acción en ambos casos: esperar o forzar reverificación. Añadir un estado visual distinto para VERIFYING crearía confusión sin valor añadido.

**Feedback de acción**: Cuando "Verificar ahora" responde con éxito (antes de que la query confirme el estado ACTIVE), aparece un `Alert variant="success"` inline: "Verificacion iniciada. Comprueba el estado en unos minutos." Este Alert es dismissible.

---

### Estado 4 — ACTIVE (dominio verificado y activo)

**Cuándo aparece**: El registro TXT fue encontrado y verificado por el sistema.

**Elementos visuales**:

```
┌─────────────────────────────────────────────────────────┐
│ Dominio personalizado                                   │
│                                                         │
│  [✓] Dominio activo                                     │
│      (círculo verde relleno con checkmark blanco)       │
│                                                         │
│  miempresa.com →                                        │
│  (link clickeable, abre en nueva pestaña)               │
│                                                         │
│  Verificado el 15 de abril de 2026                      │
│                                                         │
│  [Eliminar dominio]  ← botón destructivo (rojo)         │
└─────────────────────────────────────────────────────────┘
```

| Elemento | Especificación |
|----------|---------------|
| Indicador de estado | `div h-5 w-5 rounded-full bg-green-500` con SVG checkmark blanco interior. Label "Dominio activo" en `text-green-700 font-medium text-sm` |
| Link al dominio | `href="https://{domain}"`, `target="_blank"`, `rel="noopener noreferrer"`. Estilo: `text-primary-600 hover:underline underline-offset-4`. Incluye flecha → al final |
| Fecha de verificación | Formato: "Verificado el DD de MMMM de YYYY". 12px, `text-gray-400` |
| Botón eliminar | `variant="destructive" size="sm"`. Abre modal de confirmación, no elimina directamente |

**Decisión de diseño**: El enlace al dominio usa `underline-offset-4` para separar la línea del texto, mejorando la legibilidad. El botón "Eliminar dominio" es `size="sm"` para reducir su peso visual — es una acción destructiva poco frecuente.

---

### Estado 5 — FAILED (verificación fallida)

**Cuándo aparece**: El sistema buscó el registro TXT y no lo encontró, o el valor no coincide.

**Elementos visuales**:

```
┌─────────────────────────────────────────────────────────┐
│ Dominio personalizado                                   │
│                                                         │
│  ┌── Error ──────────────────────────────────────────┐  │
│  │ No se encontro el registro DNS para               │  │
│  │ miempresa.com. Asegurate de haber agregado        │  │
│  │ correctamente el registro TXT y espera a que se   │  │
│  │ propague (puede tardar hasta 48 horas).           │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  Pasos para resolver:                                   │
│  1. Accede al panel de tu proveedor de dominio          │
│     (GoDaddy, Namecheap, etc.)                          │
│  2. Busca la sección de gestión de DNS o zona DNS       │
│  3. Agrega un registro TXT con el valor indicado        │
│  4. Guarda los cambios y espera la propagación          │
│                                                         │
│  [Reintentar verificación]                              │
└─────────────────────────────────────────────────────────┘
```

| Elemento | Especificación |
|----------|---------------|
| Alert de error | `variant="error"`. Menciona el dominio específico en negrita dentro del mensaje |
| Lista numerada | `ol list-decimal list-inside space-y-1`. Texto `text-gray-500 text-sm`. Header "Pasos para resolver:" en `font-medium text-gray-600` |
| `TXT` en paso 3 | `font-mono font-medium` para resaltar el término técnico |
| Botón reintentar | `variant="outline"`, con spinner si `verifyMutation.isPending` |

---

## Modal de confirmación de eliminación

Aparece al pulsar "Eliminar dominio" en estado ACTIVE. Usa el componente `Modal` con `ModalBody` y `ModalFooter`.

**Contenido del modal**:

```
┌──────────────────────────────────────────┐
│  Eliminar dominio personalizado      [×] │
├──────────────────────────────────────────┤
│                                          │
│  Esta acción eliminará el dominio        │
│  miempresa.com de tu sitio. Tu sitio     │
│  seguirá accesible desde el subdominio   │
│  de EdithPress.                          │
│                                          │
├──────────────────────────────────────────┤
│                [Cancelar] [Eliminar]     │
└──────────────────────────────────────────┘
```

| Elemento | Especificación |
|----------|---------------|
| Botón cancelar | `variant="outline"`, cierra el modal sin acción |
| Botón eliminar | `variant="destructive"`, con spinner si `deleteMutation.isPending` |
| Dominio en el cuerpo | `font-medium` para resaltar el dominio específico que se eliminará |

**Decisión de diseño**: El modal informa que el sitio seguirá accesible vía subdominio de EdithPress. Esto reduce la ansiedad del usuario ante una acción destructiva: sabe que no perderá acceso al sitio.

---

## Estado de carga (skeleton)

Durante la carga inicial de la query `['domain', siteId]`:

```
┌─────────────────────────────────────────────────────────┐
│  [████████████████████████████████]  ← skeleton h-32   │
│   animate-pulse bg-gray-100 rounded-lg                  │
└─────────────────────────────────────────────────────────┘
```

Implementado como un `div h-32 rounded-lg bg-gray-100 animate-pulse`. No se renderiza la card completa para evitar el parpadeo de contenido.

---

## Criterios de accesibilidad WCAG 2.1 AA

### Roles ARIA por estado

| Estado | Elementos ARIA relevantes |
|--------|--------------------------|
| NONE | Input con `aria-label="Dominio personalizado"`. Errores de validación deben asociarse con `aria-describedby` al input |
| PENDING / VERIFYING | El punto animado tiene `aria-hidden="true"` (correcto: es decorativo). El label textual adyacente comunica el estado |
| ACTIVE | El icono checkmark tiene `aria-hidden="true"`. El link al dominio tiene texto visible. El SVG decorativo en iconos de acción necesita `aria-label` |
| FAILED | El `Alert` debe usar `role="alert"` para anuncio inmediato en lectores de pantalla |

### Notas de mejora recomendadas para iteraciones futuras

1. **Tabla DNS sin `<caption>`**: La tabla de registros DNS en PENDING/VERIFYING no tiene `<caption>`. Añadir `<caption className="sr-only">Registro DNS TXT para verificar dominio</caption>` para lectores de pantalla.

2. **`aria-live` en cambios de estado**: Cuando el polling cambia el estado de PENDING a ACTIVE, el cambio visual no se anuncia. Añadir una región `aria-live="polite"` que anuncie el nuevo estado al cambiar.

3. **Focus management**: Al conectar un dominio (transición NONE → PENDING), el foco debería moverse al nuevo contenido. Implementar con `useEffect` + `ref.current.focus()` tras la invalidación de la query.

4. **Botón "Copiar valor"**: El cambio de texto "Copiar valor" → "Copiado!" es una micro-interacción temporal. Añadir `aria-live="assertive"` al elemento que contiene el texto del botón para que lectores de pantalla lo anuncien.

5. **Contraste del badge amarillo**: El texto `text-yellow-700` (#b45309) sobre fondo `bg-yellow-50` (#fffbeb) da un ratio de 5.74:1 — pasa WCAG AA. El punto `bg-yellow-400` es decorativo (tiene `aria-hidden`), no necesita verificación de contraste.

6. **Modal con `aria-modal`**: Verificar que el componente `Modal` implementa `aria-modal="true"` y gestiona el focus trap durante su apertura.

### Contraste de colores de estado

| Token | Color | Uso de texto | Ratio sobre blanco | WCAG AA |
|-------|-------|-------------|-------------------|---------|
| `text-yellow-700` | #b45309 | Label PENDING | 5.74:1 | Pasa |
| `text-green-700` | #15803d | Label ACTIVE | 5.74:1 | Pasa |
| `bg-green-500` | #22c55e | Icono círculo (decorativo) | — | N/A |
| `--color-error` / `text-red-600` | #dc2626 | Alert FAILED | 4.83:1 | Pasa |
| `text-primary-600` | #2563eb | Link dominio | 5.16:1 | Pasa |

---

## Micro-interacciones

### Animación del badge "Pendiente" (pulse)

El indicador de estado usa Tailwind `animate-pulse` aplicado al punto circular. Esta utilidad genera una animación CSS `@keyframes pulse` que alterna opacidad entre 1 y 0.5 cada 2 segundos.

```
Clase: h-2 w-2 rounded-full bg-yellow-400 animate-pulse
Duración: 2s (Tailwind default)
Timing: cubic-bezier(0.4, 0, 0.6, 1)
aria-hidden="true" — el punto es decorativo, no comunica información por sí solo
```

**Nota WCAG**: La animación `animate-pulse` es continua. Respetar `prefers-reduced-motion` añadiendo la directiva Tailwind `motion-reduce:animate-none` al elemento. Pendiente de implementar en código fuente.

### Feedback del botón "Copiar" (2 segundos)

Implementado con estado local `copied` (boolean) y `setTimeout`.

```
Estado inicial:  "Copiar valor"  → variant="outline" size="sm"
Tras clic:       "Copiado!"      → mismo variant (sin cambio de estilo en implementación actual)
Duración:        2000ms
Regresa a:       "Copiar valor"
```

**Mejora recomendada**: Añadir un icono de checkmark cuando el texto es "Copiado!" para reforzar el feedback con señal visual adicional (no solo texto). El cambio de color del botón a `variant="success"` temporal también comunicaría el éxito de forma más clara.

### Modal de confirmación antes de eliminar

La transición entre "botón Eliminar dominio" y el modal sigue el flujo:

```
Clic en "Eliminar dominio"
  → setShowDeleteModal(true)
  → Modal aparece (sin animación de entrada en implementación actual)
  → Foco debe moverse al primer elemento interactivo del modal (botón "Cancelar")
  → Clic en "Cancelar": setShowDeleteModal(false), foco regresa al botón "Eliminar dominio"
  → Clic en "Eliminar": deleteMutation.mutate(), spinner en botón, modal cierra en onSuccess
```

**Mejora recomendada**: Añadir animación de entrada al modal (`transition-opacity duration-200`) y asegurar que el componente `Modal` gestiona el focus trap correctamente durante toda la interacción.
