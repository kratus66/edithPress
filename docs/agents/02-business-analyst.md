# Agente 02 — Business Analyst
**Proyecto**: EdithPress — SaaS CMS Platform
**Rol**: Business Analyst
**Chat dedicado**: Sí — abrir chat nuevo, decir "Actúa como Business Analyst de EdithPress, lee docs/agents/02-business-analyst.md"

---

## Responsabilidades
- Definir user stories y criterios de aceptación
- Analizar competidores y posicionamiento de mercado
- Diseñar flujos de usuario (onboarding, billing, publicación)
- Definir pricing strategy y modelo financiero
- Establecer KPIs y métricas de negocio
- Validar que el producto resuelve el problema real del cliente

## Dependencias con otros agentes
- Entrega a: PM (user stories), UX (flujos), Backend (reglas de negocio)
- Recibe de: UX (feedback de usabilidad), PM (prioridades)

---

## Modelo de Negocio

### Planes y Precios
| Plan | Precio/mes | Precio/año | Límites | Target |
|------|-----------|-----------|---------|--------|
| Starter | $9.99 | $95.90 (20% off) | 1 sitio, 5 páginas, 1GB storage, subdominio | Freelancers, emprendedores |
| Business | $29.99 | $287.90 | 3 sitios, páginas ilimitadas, 10GB, dominio custom | PYMEs |
| Pro | $79.99 | $767.90 | 10 sitios, e-commerce, 50GB, analítica avanzada | Agencias pequeñas |
| Enterprise | Custom | Custom | Ilimitado, white-label, API, SLA | Agencias grandes, corporativos |

### Fuentes de Ingreso
1. **Suscripciones** (80% revenue): MRR/ARR recurrente
2. **Templates premium** (10%): Marketplace $15–$99 por template
3. **Dominios** (5%): Resale con 20–30% de margen
4. **Servicios de diseño** (3%): Setup inicial one-time $99–$499
5. **Plugins/extensiones** (2%): Comisión 30% sobre ventas de terceros

### Proyección Financiera (Año 1)
| Mes | Clientes | MRR | ARR |
|-----|---------|-----|-----|
| 1 | 10 | $200 | $2,400 |
| 3 | 50 | $1,000 | $12,000 |
| 6 | 150 | $3,000 | $36,000 |
| 12 | 400 | $8,000 | $96,000 |

**Break-even estimado**: Mes 8–10 con costos de infraestructura ~$300/mes

---

## Análisis de Competidores
| Característica | EdithPress | WordPress.com | Wix | Webflow |
|---------------|-----------|--------------|-----|---------|
| Precio entrada | $9.99 | $9 | $16 | $14 |
| Editor visual | ✅ | ⚠️ (Gutenberg) | ✅ | ✅ |
| E-commerce | Fase 3 | ✅ | ✅ | ✅ |
| Custom domain | Plan Business | Plan Personal | Plan Combo | Plan Basic |
| White-label | ✅ (Enterprise) | ❌ | ❌ | ⚠️ |
| Vendor lock-in | Bajo | Bajo | Alto | Alto |
| Curva aprendizaje | Baja | Media | Baja | Alta |

**Diferenciadores clave de EdithPress**:
1. Pensado para vender a clientes (el dueño es la agencia)
2. White-label nativo desde Enterprise
3. Sin comisiones de e-commerce (Wix cobra 3%)
4. Precio competitivo con más funciones por tier

---

## User Stories Principales

### Epic: Onboarding
- **US-001**: Como nuevo usuario, quiero registrarme con email+password para crear mi cuenta.
- **US-002**: Como nuevo usuario, quiero ver un wizard de onboarding para crear mi primer sitio en < 5 minutos.
- **US-003**: Como usuario, quiero elegir un template inicial para no empezar desde cero.

### Epic: Editor de Páginas
- **US-010**: Como editor del sitio, quiero arrastrar componentes a la página para diseñar sin código.
- **US-011**: Como editor, quiero cambiar textos haciendo click en ellos (edición inline).
- **US-012**: Como editor, quiero previsualizar mi sitio en mobile/tablet/desktop antes de publicar.
- **US-013**: Como editor, quiero publicar mi página con un clic para que sea visible al público.
- **US-014**: Como editor, quiero deshacer cambios (Ctrl+Z) para no perder trabajo.

### Epic: Gestión de Sitios
- **US-020**: Como admin del sitio, quiero conectar mi dominio propio para tener URL profesional.
- **US-021**: Como admin, quiero ver estadísticas básicas (visitas, páginas vistas) de mi sitio.
- **US-022**: Como admin, quiero gestionar el menú de navegación de mi sitio.

### Epic: Billing
- **US-030**: Como usuario, quiero suscribirme a un plan con tarjeta de crédito.
- **US-031**: Como usuario, quiero hacer upgrade/downgrade de mi plan.
- **US-032**: Como usuario, quiero cancelar mi suscripción y que mis datos se conserven 30 días.

### Epic: Super Admin
- **US-040**: Como dueño de la plataforma, quiero ver todos los tenants activos y su estado.
- **US-041**: Como dueño, quiero poder suspender/activar una cuenta de cliente.
- **US-042**: Como dueño, quiero ver el MRR y métricas de negocio en un dashboard.

---

## KPIs y Métricas
- **MRR** (Monthly Recurring Revenue): objetivo $1K en mes 3
- **Churn rate**: < 5% mensual
- **CAC** (Customer Acquisition Cost): < $20
- **LTV** (Lifetime Value): > $200
- **Time to first site**: < 5 minutos desde el registro
- **NPS** (Net Promoter Score): > 40

---

## Flujos de Usuario Clave

### Flujo 1: Nuevo cliente
1. Landing page → CTA "Crear mi sitio gratis" → Registro
2. Onboarding wizard (nombre del sitio, categoría, template)
3. Editor abre con template seleccionado
4. Tour guiado (tooltips en primeros pasos)
5. Publicar → Ver sitio en `nombre.edithpress.com`
6. Prompt para upgrade después de 7 días / si intenta usar feature premium

### Flujo 2: Publicar una página
1. Dashboard → Mis sitios → Editar
2. Editor carga página actual
3. Hacer cambios (drag & drop, edición inline)
4. Preview → Publicar
5. Confirmación: "Tu sitio está en vivo en [URL]"

### Flujo 3: Contratar plan
1. Banner/prompt de upgrade → Ver planes
2. Seleccionar plan → Checkout Stripe
3. Email de confirmación
4. Features del nuevo plan disponibles inmediatamente

---

## Checklist de Progreso

### FASE 0
- [x] Modelo de negocio documentado
- [x] Análisis de competidores completo
- [x] User stories del MVP escritas
- [x] KPIs definidos
- [x] Flujos de usuario documentados
- [ ] Pricing validado con usuarios potenciales (1–5 entrevistas)
- [ ] Modelo financiero en spreadsheet

### FASE 1 — MVP
- [x] Criterios de aceptación para US-001 a US-014 detallados (BA-01)
- [x] Reglas de límites por plan documentadas (BA-02)
- [x] Flujos validados con observaciones para UX y QA (BA-03)
- [x] Definition of Done acordado con PM (BA-04)
- [ ] Wireframes aprobados por UX designer

### FASE 2 — v1
- [ ] User stories para templates, dominios y analítica
- [ ] Análisis de retención en primeros 30 días
- [ ] Survey de NPS a primeros 20 clientes

---

## Buenas Prácticas de Análisis de Negocio

### User Stories — criterio INVEST
Cada User Story debe cumplir:
- **I**ndependent: no depende de otra story para tener valor
- **N**egotiable: el "cómo" puede cambiar, el "qué" y el "por qué" no
- **V**aluable: entrega valor al usuario final, no solo técnico
- **E**stimable: el equipo puede estimar su complejidad
- **S**mall: cabe en un sprint (1–2 semanas máximo)
- **T**estable: tiene criterios de aceptación claros y verificables

### Criterios de aceptación — formato Gherkin
```
Given [contexto inicial]
When [acción del usuario]
Then [resultado esperado]
And [resultado adicional opcional]
```
Ejemplo para US-001:
```
Given que estoy en la página de registro
When lleno nombre, email válido y contraseña >= 8 caracteres
Then se crea mi cuenta
And recibo un email de verificación
And soy redirigido a la página de verificación pendiente
```

### Reglas de negocio — documentar explícitamente
- Toda regla de negocio que no es obvia debe estar documentada ANTES de que el backend la implemente
- Las reglas de plan (límites de sitios, páginas, storage) deben ser verificadas tanto en el frontend (UX) como en el backend (guard)
- Los cambios en reglas de negocio requieren actualizar: este doc + Backend + Frontend + Tests

---

## Tareas Asignadas — FASE 0 (Activa)

### Tarea BA-01 — Detallar criterios de aceptación para FASE 1
**Prioridad**: CRÍTICA — El Backend y Frontend necesitan estos criterios para implementar correctamente
**Criterio de Done**: Las US-001 a US-013 tienen criterios de aceptación en formato Gherkin
**Entregar a**: Backend Developer (Agente 05), Frontend Admin (Agente 06)

### Tarea BA-02 — Documentar reglas de límites por plan
**Prioridad**: CRÍTICA
**Criterio de Done**: Existe una tabla clara de qué está permitido en cada plan, usable por el backend para implementar guards
**Archivo**: Agregar sección "Reglas de Plan" a este documento
**Contenido mínimo**:
```
| Acción                | Starter | Business | Pro    | Enterprise |
|-----------------------|---------|----------|--------|------------|
| Crear sitio           | 1       | 3        | 10     | ∞          |
| Páginas por sitio     | 5       | ∞        | ∞      | ∞          |
| Storage               | 1GB     | 10GB     | 50GB   | custom     |
| Custom domain         | No      | Sí       | Sí     | Sí         |
| E-commerce            | No      | No       | Sí     | Sí         |
| Analytics dashboard   | No      | Básico   | Avanzado| Completo  |
```

### Tarea BA-03 — Validar flujos con el UX Designer
**Prioridad**: ALTA
**Criterio de Done**: Los 3 flujos principales (Onboarding, Publicar página, Contratar plan) están validados y aprobados con el Agente 12
**Entrega a**: Frontend Admin (Agente 06), QA (Agente 11)

### Tarea BA-04 — Definition of Done para FASE 1
**Prioridad**: ALTA
**Criterio de Done**: El PM tiene un DoD por cada User Story del MVP
**Coordinar con**: PM (Agente 01)

---

## Entregables BA — FASE 1

---

### BA-01 — Criterios de Aceptación (Gherkin) · US-001 a US-014

#### US-001 — Registro con email + password

```gherkin
Given que estoy en la página de registro
When lleno nombre completo, email válido y contraseña >= 8 caracteres y hago clic en "Crear cuenta"
Then se crea mi cuenta en estado "pendiente de verificación"
And recibo un email de verificación en menos de 2 minutos
And soy redirigido a la pantalla "Verifica tu email"

Given que estoy en la página de registro
When ingreso un email que ya existe en el sistema
Then veo el mensaje de error "Este email ya está registrado"
And el formulario no se envía

Given que estoy en la página de registro
When ingreso una contraseña de menos de 8 caracteres
Then el botón "Crear cuenta" permanece deshabilitado
And veo el mensaje "La contraseña debe tener al menos 8 caracteres"

Given que recibí el email de verificación
When hago clic en el enlace de verificación
Then mi cuenta pasa a estado "activa"
And soy redirigido al wizard de onboarding
```

---

#### US-002 — Wizard de onboarding (< 5 minutos)

```gherkin
Given que acabo de verificar mi email por primera vez
When accedo al dashboard
Then veo el wizard de onboarding de 3 pasos (nombre del sitio, categoría, template)

Given que estoy en el wizard de onboarding
When completo los 3 pasos y hago clic en "Crear mi sitio"
Then se crea mi sitio con URL {nombre-elegido}.edithpress.com
And el tiempo total desde el registro hasta tener el sitio creado es < 5 minutos
And soy redirigido al editor con el template aplicado y listo para editar

Given que estoy en el wizard
When hago clic en "Omitir por ahora"
Then salto al dashboard sin crear un sitio
And veo un banner "Crea tu primer sitio" que persiste hasta que cree uno

Given que el nombre de sitio que ingreso ya está tomado
When intento continuar al paso siguiente
Then veo el mensaje "Esta URL ya está en uso, elige otro nombre"
And se sugieren 3 alternativas disponibles
```

---

#### US-003 — Elegir template inicial

```gherkin
Given que estoy en el paso "Elegir template" del wizard
When veo la galería
Then hay al menos 6 templates disponibles organizados por categoría (Negocio, Portfolio, Blog, Landing)

Given que estoy en la galería de templates
When hago clic en "Vista previa" de un template
Then se abre una previsualización a pantalla completa sin salir del wizard
And puedo navegar entre templates desde la previsualización

Given que selecciono un template y confirmo
When hago clic en "Usar este template"
Then el template se aplica a mi sitio
And en el editor veo el template con textos e imágenes de ejemplo reemplazables

Given que estoy en el editor con un template aplicado
When hago clic en "Cambiar template"
Then veo la galería de templates de nuevo
And al confirmar un nuevo template veo un aviso "Se reemplazará el contenido actual. ¿Continuar?"
```

---

#### US-010 — Drag & drop de componentes

```gherkin
Given que estoy en el editor de páginas
When arrastro un componente desde el panel lateral hacia el canvas
Then el componente se inserta en la posición donde lo solté
And veo una guía visual (placeholder azul) que indica dónde se insertará mientras arrastro

Given que tengo componentes en el canvas y arrastro uno a otra posición
When lo suelto sobre otro componente
Then el componente arrastrado se inserta arriba o abajo del objetivo según la mitad donde se suelta
And los demás componentes se reordenan sin superponerse

Given que intento arrastrar un componente al canvas
When el plan del usuario es Starter y la página ya tiene 5 secciones
Then el componente no se inserta
And aparece un tooltip "Límite de secciones alcanzado en el plan Starter — Haz upgrade"
```

---

#### US-011 — Edición inline de textos

```gherkin
Given que estoy en el editor y hay un bloque de texto en el canvas
When hago doble clic sobre el texto
Then el texto entra en modo edición inline con cursor activo
And aparece una barra de formato flotante (negrita, cursiva, alineación, tamaño)

Given que estoy editando texto inline
When presiono Escape o hago clic fuera del componente
Then salgo del modo edición
And el cambio queda guardado automáticamente en el historial de cambios

Given que estoy editando texto inline
When aplico un formato (negrita, color, tamaño)
Then el cambio se refleja en tiempo real en el canvas
And el cambio es incluido en el historial de Ctrl+Z

Given que hay un campo de texto vacío en el canvas
When hago doble clic sobre él
Then veo el placeholder "Haz clic para escribir..." desaparecer
And el cursor queda activo listo para escribir
```

---

#### US-012 — Preview en mobile / tablet / desktop

```gherkin
Given que estoy en el editor
When hago clic en el botón "Preview" (o presiono Ctrl+P)
Then se abre la vista previa del sitio en modo desktop (ancho completo)
And el botón "Publicar" sigue visible en la barra superior

Given que estoy en la vista previa
When selecciono el modo "Mobile"
Then el canvas se muestra con ancho 375px centrado en pantalla
And los elementos responsivos se adaptan al ancho

Given que estoy en la vista previa
When selecciono el modo "Tablet"
Then el canvas se muestra con ancho 768px centrado en pantalla

Given que estoy en la vista previa en cualquier modo
When hago clic en "Volver al editor"
Then regreso al editor en el mismo estado que lo dejé sin perder cambios

Given que estoy en la vista previa
When hago clic en un enlace interno del sitio
Then la navegación funciona dentro de la vista previa (simula el comportamiento real)
```

---

#### US-013 — Publicar página con un clic

```gherkin
Given que tengo cambios sin publicar en el editor
When hago clic en el botón "Publicar"
Then se inicia el proceso de deploy
And veo un indicador de progreso "Publicando..."

Given que el deploy se completó exitosamente
When el proceso termina
Then veo la notificación "¡Tu sitio está en vivo! Ver sitio → {URL}"
And el indicador "Cambios sin publicar" desaparece de la barra superior
And el sitio público refleja los nuevos cambios en < 30 segundos

Given que hago clic en "Publicar"
When el proceso tarda más de 5 segundos
Then veo un spinner con el mensaje "Publicando cambios..."
And puedo seguir editando mientras se completa el deploy

Given que ocurre un error durante el deploy
When el proceso falla
Then veo el mensaje "Error al publicar. Tu última versión publicada sigue disponible."
And se registra el error para soporte
And el botón "Publicar" vuelve a estar disponible para reintentar
```

---

#### US-014 — Deshacer / Rehacer cambios (Ctrl+Z / Ctrl+Y)

```gherkin
Given que realicé un cambio en el editor (mover, editar texto, borrar componente)
When presiono Ctrl+Z
Then el último cambio se deshace
And el canvas vuelve al estado anterior inmediatamente

Given que presiono Ctrl+Z repetidamente
When hay múltiples cambios en el historial
Then cada presión deshace un cambio en orden inverso (LIFO)
And puedo deshacer hasta 50 cambios dentro de la misma sesión

Given que deshice uno o más cambios
When presiono Ctrl+Y (o Ctrl+Shift+Z)
Then el cambio deshecho se rehace en orden
And el canvas refleja el estado correcto

Given que publiqué el sitio y luego deshago cambios
When presiono Ctrl+Z después de publicar
Then los cambios locales se deshacen
But la versión publicada del sitio no se revierte automáticamente (requiere re-publicar)

Given que cierro el editor y vuelvo a abrir la página
When regreso a la sesión
Then el historial de cambios se reinicia (no persiste entre sesiones)
```

---

### BA-02 — Reglas de Límites por Plan

#### Tabla maestra de features y límites

| Acción / Feature              | Starter    | Business   | Pro        | Enterprise  |
|-------------------------------|-----------|-----------|-----------|-------------|
| Sitios activos                | 1          | 3          | 10         | Ilimitado   |
| Páginas por sitio             | 5          | Ilimitado  | Ilimitado  | Ilimitado   |
| Storage total                 | 1 GB       | 10 GB      | 50 GB      | Custom      |
| Subdominio edithpress.com     | ✅         | ✅         | ✅         | ✅          |
| Dominio custom propio         | ❌         | ✅         | ✅         | ✅          |
| SSL automático                | ✅         | ✅         | ✅         | ✅          |
| E-commerce (tienda online)    | ❌         | ❌         | ✅         | ✅          |
| Analytics básico (visitas)    | ❌         | ✅         | ✅         | ✅          |
| Analytics avanzado            | ❌         | ❌         | ✅         | ✅          |
| Analytics completo + export   | ❌         | ❌         | ❌         | ✅          |
| Templates premium             | ❌         | ✅         | ✅         | ✅          |
| Colaboradores por sitio       | 1 (solo el dueño) | 3   | 10         | Ilimitado   |
| Widgets de terceros           | ❌         | ✅         | ✅         | ✅          |
| Eliminar branding EdithPress  | ❌         | ❌         | ❌         | ✅          |
| White-label completo          | ❌         | ❌         | ❌         | ✅          |
| API acceso                    | ❌         | ❌         | ✅         | ✅          |
| SLA garantizado               | ❌         | ❌         | ❌         | ✅          |
| Soporte                       | Email      | Email + Chat | Chat prioritario | Dedicado |
| Exportar contenido            | ❌         | ✅         | ✅         | ✅          |
| Backup automático             | ❌         | Semanal    | Diario     | En tiempo real |

#### Reglas de negocio explícitas para el backend (guards)

**RN-01 — Límite de sitios**
- Al intentar crear un sitio, verificar `sitiosActivos < limiteDelPlan`.
- Si se alcanza el límite: responder `403` con código `PLAN_SITE_LIMIT_REACHED`.
- El frontend muestra modal de upgrade antes de hacer la llamada (validación anticipada).

**RN-02 — Límite de páginas**
- Al crear una página, verificar `paginasEnSitio < limiteDelPlan` (solo aplica Starter: 5).
- Starter: máximo 5 páginas por sitio incluyendo la página de inicio.
- Si se alcanza el límite: `403` con código `PLAN_PAGE_LIMIT_REACHED`.

**RN-03 — Storage**
- Verificar antes de cada upload de archivo: `storageUsado + tamanioArchivo <= storageMaximo`.
- Si se excede: `413` con código `PLAN_STORAGE_LIMIT_REACHED`.
- El dashboard del usuario muestra barra de uso de storage en tiempo real.

**RN-04 — Dominio custom**
- Solo disponible desde plan Business. Intentar asociar un dominio en plan Starter retorna `403` con código `FEATURE_NOT_IN_PLAN`.

**RN-05 — E-commerce**
- Solo disponible desde plan Pro. Intentar activar la tienda en Starter/Business retorna `403` con `FEATURE_NOT_IN_PLAN`.

**RN-06 — Downgrade de plan**
- Si el usuario hace downgrade y su uso actual excede los límites del nuevo plan:
  - Mostrar advertencia ANTES de confirmar el downgrade indicando qué excede.
  - Si confirma: los sitios/páginas en exceso pasan a estado `archived` (no se eliminan).
  - Los recursos archivados se conservan 30 días antes de eliminación permanente.
  - El usuario recibe un email con el detalle de lo que quedó archivado.

**RN-07 — Cancelación de suscripción**
- Al cancelar: el plan se mantiene activo hasta el fin del período ya pagado.
- Después del período: la cuenta pasa a estado `free` (sin plan activo).
- Los datos del usuario se conservan 30 días en estado `free` antes de eliminación.
- El usuario recibe aviso por email a los 7 días, 3 días y 1 día antes de la eliminación.

**RN-08 — Trial / Periodo gratuito**
- No hay plan free permanente. El onboarding da acceso a un preview del editor sin publicar.
- Para publicar y tener URL pública, se requiere suscripción activa (mínimo Starter).

---

### BA-03 — Validación de Flujos de Usuario

> Validación realizada en rol BA con perspectiva de UX (Agente 12) y QA (Agente 11).
> Estado: **Aprobados con observaciones documentadas**.

#### Flujo 1: Nuevo cliente — Onboarding

**Versión validada**:
1. Landing page → CTA "Crear mi sitio gratis" → Página de Registro
2. Formulario: nombre completo, email, contraseña → Email de verificación
3. Clic en enlace de verificación → Wizard de onboarding (3 pasos)
   - Paso 1: Nombre del sitio (con validación de disponibilidad en tiempo real)
   - Paso 2: Categoría del sitio (Negocio, Portfolio, Blog, Landing Page, Otro)
   - Paso 3: Selección de template (mínimo 6, con opción de preview)
4. "Crear mi sitio" → Editor abre con template aplicado
5. Tour guiado con 4 tooltips (panel de componentes, edición inline, preview, publicar)
6. Usuario hace cambios y publica → Confirmación con URL del sitio
7. A los 7 días o al intentar usar feature premium → Modal de upgrade

**Observaciones y reglas derivadas**:
- **OBS-01**: El paso de verificación de email es un punto de abandono alto. Mitigación: reenviar email automáticamente si no se verifica en 10 minutos + botón "Reenviar email" visible.
- **OBS-02**: El wizard debe funcionar sin necesidad de introducir datos de pago (no hay free plan pero sí onboarding completo antes de pedir tarjeta).
- **OBS-03**: El tour guiado debe poderse omitir y reactivar desde el menú de ayuda.
- **OBS-04**: Si el usuario cierra el wizard a medias, al volver debe reanudarlo desde el paso donde lo dejó (estado persistido en sesión).

---

#### Flujo 2: Publicar una página

**Versión validada**:
1. Dashboard → "Mis sitios" → Tarjeta del sitio → "Editar"
2. El editor carga la última versión guardada de la página activa
3. El usuario hace cambios (drag & drop, edición inline, ajustes de estilo)
4. Preview (Ctrl+P) → revisar en mobile/tablet/desktop
5. "Publicar" → Indicador de progreso → Confirmación con URL
6. La URL pública refleja los cambios en < 30 segundos

**Observaciones y reglas derivadas**:
- **OBS-05**: Guardar automáticamente cada 30 segundos mientras el usuario edita (autosave). El usuario no debe perder cambios si cierra el navegador accidentalmente.
- **OBS-06**: Diferenciar visualmente entre "guardado" (estado local) y "publicado" (visible al público). Usar indicadores claros: "Guardado automáticamente" vs. "En vivo".
- **OBS-07**: Si el usuario intenta cerrar el tab con cambios no publicados, mostrar confirmación del navegador ("¿Salir sin publicar?").
- **OBS-08**: El botón "Publicar" debe estar siempre visible en la barra superior del editor, no dentro de un menú.

---

#### Flujo 3: Contratar / Cambiar de plan

**Versión validada**:
1. Trigger: Banner de upgrade en dashboard / Modal al alcanzar límite / Sección "Planes" en configuración
2. Pantalla de planes: tabla comparativa con toggle mensual/anual (descuento 20% visible)
3. Usuario selecciona plan → Checkout Stripe (formulario de tarjeta inline, no redirección)
4. Pago exitoso → Email de confirmación con detalle del plan y próxima fecha de facturación
5. Features del nuevo plan disponibles inmediatamente (sin necesidad de recargar)
6. Panel de cuenta muestra el plan activo y próxima renovación

**Observaciones y reglas derivadas**:
- **OBS-09**: El checkout debe ser inline (Stripe Elements), nunca redirigir a una URL externa, para reducir abandono.
- **OBS-10**: Para downgrade: mostrar advertencia de impacto ANTES del checkout (qué features se pierden, qué recursos quedan archivados) con botón de confirmación explícito.
- **OBS-11**: Para upgrade desde dentro del editor (al alcanzar un límite): el usuario debe poder completar el upgrade y volver directamente al editor sin perder su trabajo.
- **OBS-12**: Ofrecer siempre el precio anual como opción destacada (mayor LTV) con el descuento claramente visible.

---

### BA-04 — Definition of Done (DoD) por User Story — FASE 1

> Acordado con PM (Agente 01). Aplica a todas las User Stories del MVP (US-001 a US-014).

#### DoD General (aplica a TODAS las US)

Una User Story se considera **Done** cuando cumple todos los siguientes puntos:

- [ ] El código pasa todos los criterios de aceptación Gherkin documentados en BA-01
- [ ] Existe al menos 1 test unitario y 1 test de integración por criterio de aceptación principal
- [ ] No hay errores de lint ni de TypeScript (`pnpm lint && pnpm typecheck` sin errores)
- [ ] El comportamiento fue validado manualmente en Chrome, Firefox y Safari (desktop)
- [ ] El comportamiento fue validado en viewport mobile (375px) y tablet (768px)
- [ ] Las reglas de negocio (RN-XX) relevantes están implementadas en el backend (guard) y en el frontend (validación anticipada)
- [ ] El PR fue revisado y aprobado por al menos 1 otro desarrollador
- [ ] No se introducen regresiones en otras User Stories del mismo sprint (smoke test)
- [ ] Los endpoints de API relevantes están documentados en el contrato OpenAPI
- [ ] El PM marcó la US como aceptada en el board

---

#### DoD específico por User Story

| US | Criterio adicional específico |
|----|-------------------------------|
| US-001 | El email de verificación se envía y el enlace expira en 24 h. La cuenta no puede iniciar sesión hasta verificar el email. |
| US-002 | El wizard completo (registro → sitio creado) se ejecuta en < 5 min medido con Lighthouse trace. El estado del wizard persiste si se cierra el navegador. |
| US-003 | La galería de templates muestra mínimo 6 templates. La previsualización carga en < 2 segundos. |
| US-010 | El drag & drop funciona con mouse y con touch (tablet). El límite de secciones en plan Starter muestra el CTA de upgrade. |
| US-011 | La edición inline no modifica el HTML de estructura del componente. El autosave captura el cambio en < 30 segundos. |
| US-012 | El preview en mobile (375 px), tablet (768 px) y desktop (1280 px) refleja fielmente el sitio publicado. El botón de volver al editor no pierde cambios. |
| US-013 | El sitio publicado es accesible públicamente en < 30 segundos. El deploy no interrumpe la sesión de edición. |
| US-014 | El historial soporta hasta 50 acciones por sesión. Ctrl+Z y Ctrl+Y funcionan en Chrome, Firefox y Safari. |

---

## Estado Actual
**Fase activa**: FASE 0 → preparando FASE 1
**Última actualización**: 2026-04-13
**Tareas completadas**: BA-01 ✅ · BA-02 ✅ · BA-03 ✅ · BA-04 ✅
**Próxima tarea**: Entregar BA-01/BA-02 al Backend Developer (Agente 05) y Frontend Admin (Agente 06); entregar BA-03 al UX Designer (Agente 12) y QA (Agente 11); entregar BA-04 al PM (Agente 01)
