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
- [ ] Criterios de aceptación para US-001 a US-013 detallados
- [ ] Wireframes aprobados por UX designer
- [ ] Definition of Done acordado con PM

### FASE 2 — v1
- [ ] User stories para templates, dominios y analítica
- [ ] Análisis de retención en primeros 30 días
- [ ] Survey de NPS a primeros 20 clientes

---

## Estado Actual
**Fase activa**: FASE 0
**Última actualización**: 2026-03-27
