# EdithPress — Catálogo de Bloques
**Versión**: v1.1 — Sprint 03.1  
**Fecha**: 2026-04-24

> Referencia completa de todos los bloques disponibles en el builder de EdithPress,  
> con casos de uso por industria y análisis de tipos de sitios que se pueden construir.

---

## Bloques Disponibles (14 total)

### 1. NavbarBlock — Navbar / Menú
**Descripción**: Barra de navegación principal con logo, links, buscador y carrito.  
**Casos de uso**: Todo tipo de sitio. Siempre debe ser el primer bloque.  
**Configuraciones clave**: Logo (texto o imagen), links editables, sticky scroll, toggle búsqueda/carrito.  
**Variantes de layout**: Logo a la izquierda / Logo centrado.

---

### 2. HeroBlock — Hero / Banner Principal
**Descripción**: Sección de bienvenida con título H1, subtítulo y botón CTA. Soporte de imagen de fondo.  
**Casos de uso**: Cualquier tipo de sitio como primera sección de contenido.  
**Configuraciones clave**: Colores, imagen de fondo, tamaño de fuente, alineación, padding.

---

### 3. TextBlock — Texto Enriquecido
**Descripción**: Bloque de texto largo con soporte de markdown básico.  
**Casos de uso**: Páginas "Acerca de", descripciones de servicios, términos y condiciones.

---

### 4. ImageBlock — Imagen
**Descripción**: Imagen centrada con control de ancho y caption opcional.  
**Casos de uso**: Ilustraciones, fotografías de productos, diagramas.

---

### 5. ButtonBlock — Botón
**Descripción**: Botón de llamada a la acción (CTA) independiente.  
**Casos de uso**: CTA secundarios, botones de descarga, links a páginas internas.

---

### 6. ProductGridBlock — Grilla de Productos
**Descripción**: Catálogo de productos/servicios en grilla con imagen, precio y botón.  
**Casos de uso**: Tiendas online, catálogos de artesanías, menús de restaurantes, servicios.  
**Configuraciones clave**: 2/3/4 columnas, mostrar/ocultar artesano y categoría, estilo de tarjeta.

---

### 7. CardGridBlock — Grilla de Tarjetas
**Descripción**: Grilla de tarjetas con imagen, título, descripción y enlace.  
**Casos de uso**: Equipo, servicios, blog posts recientes, portfolio items.

---

### 8. GalleryBlock — Galería de Imágenes
**Descripción**: Galería masonry o grid con imágenes en lightbox.  
**Casos de uso**: Portafolio de fotógrafos, galería de productos artesanales, antes/después.

---

### 9. StatsBlock — Estadísticas / Contadores
**Descripción**: Fila de estadísticas numéricas con iconos para generar confianza.  
**Casos de uso**: Negocios con logros cuantificables, ONGs, consultoras, tiendas establecidas.  
**Ejemplo**: "50+ Artesanos | 200+ Productos | 15 Años | 100% Hecho a mano"

---

### 10. VideoBlock — Video
**Descripción**: Embed de video de YouTube o Vimeo con control de aspect ratio y autoplay.  
**Casos de uso**: Demos de producto, testimonios en video, tutoriales.

---

### 11. PricingBlock — Tabla de Precios
**Descripción**: Grid de planes/precios con lista de características y CTA por plan.  
**Casos de uso**: SaaS, suscripciones, servicios profesionales, membresías.

---

### 12. ContactFormBlock — Formulario de Contacto
**Descripción**: Formulario de contacto con campos nombre, email y mensaje.  
**Casos de uso**: Páginas de contacto, cotizaciones, reservas.

---

### 13. NewsletterBlock — Suscripción / Newsletter
**Descripción**: Formulario de suscripción por email con feedback visual de éxito/error.  
**Casos de uso**: E-commerce, blogs, negocios locales que quieren construir lista de contactos.  
**Funcionalidad**: Registra el email en la BD asociado al sitio. Previene duplicados.

---

### 14. SeparatorBlock — Separador
**Descripción**: Línea divisoria o espacio en blanco entre secciones.  
**Casos de uso**: Separar secciones visualmente, añadir espacio vertical.

---

## Tipos de Sitio Cubiertos (Sprint 03.1)

### ✅ Landing Page de Producto/Servicio
**Bloques**: NavbarBlock + HeroBlock + TextBlock + StatsBlock + NewsletterBlock  
**Ejemplo**: Agencia de marketing, estudio de diseño, consultora.

### ✅ Tienda Online Básica
**Bloques**: NavbarBlock + HeroBlock + ProductGridBlock + StatsBlock + NewsletterBlock  
**Ejemplo**: Tienda de artesanías colombianas, boutique, tienda de regalos.

### ✅ Portafolio
**Bloques**: NavbarBlock + HeroBlock + GalleryBlock + CardGridBlock  
**Ejemplo**: Fotógrafo, diseñador gráfico, arquitecto.

### ✅ Restaurante / Negocio de Comida
**Bloques**: NavbarBlock + HeroBlock + TextBlock + ImageBlock + ProductGridBlock + ContactFormBlock  
**Ejemplo**: Restaurante local, cafetería, servicio de catering.

### ✅ Organización / ONG
**Bloques**: NavbarBlock + HeroBlock + StatsBlock + CardGridBlock + NewsletterBlock  
**Ejemplo**: Fundación, asociación de artesanos, ONG cultural.

### ✅ Negocio Local
**Bloques**: NavbarBlock + HeroBlock + TextBlock + CardGridBlock + ContactFormBlock  
**Ejemplo**: Peluquería, ferretería, consultorio médico.

### ✅ Negocio con Precios/Planes
**Bloques**: NavbarBlock + HeroBlock + TextBlock + PricingBlock + NewsletterBlock  
**Ejemplo**: SaaS, gimnasio, escuela de idiomas.

### ⚠️ Blog
**Bloques disponibles**: NavbarBlock + HeroBlock + CardGridBlock (para posts recientes)  
**Faltante**: Bloque de artículos/posts dinámicos — **planificado para sprint futuro**.

### ⚠️ E-commerce Completo
**Bloques disponibles**: NavbarBlock + ProductGridBlock + StatsBlock + NewsletterBlock  
**Faltante**: Carrito, checkout, páginas de producto individuales — **planificado para sprint futuro**.

---

## Historias de Usuario por Bloque Nuevo (Sprint 03.1)

### NavbarBlock
> Como dueño de un sitio web,  
> quiero agregar una barra de navegación configurable,  
> para que mis visitantes puedan navegar fácilmente entre las secciones de mi sitio.

**Criterios de aceptación:**
- Puedo configurar el logo (texto o imagen)
- Puedo agregar/editar/eliminar links de navegación
- Puedo elegir si la barra queda fija (sticky) al hacer scroll
- Puedo mostrar u ocultar íconos de búsqueda y carrito
- Puedo cambiar colores de fondo, texto y acento

### ProductGridBlock
> Como dueño de una tienda,  
> quiero mostrar mis productos en una grilla visual,  
> para que los visitantes puedan explorar el catálogo fácilmente.

**Criterios de aceptación:**
- Puedo agregar productos con imagen, nombre, precio, categoría y descripción
- Puedo configurar cuántas columnas mostrar (2, 3 o 4)
- Puedo agregar un botón de acción por producto
- Puedo mostrar u ocultar el campo de artesano
- Puedo personalizar el título de la sección

### StatsBlock
> Como dueño de un negocio,  
> quiero mostrar estadísticas clave de mi negocio,  
> para generar confianza en los visitantes.

**Criterios de aceptación:**
- Puedo agregar entre 2 y 6 estadísticas
- Cada estadística tiene un valor y una etiqueta con emoji opcional
- Puedo elegir el color de fondo y de los números
- La sección se ve bien en mobile (columnas apiladas)

### NewsletterBlock
> Como dueño de un negocio,  
> quiero tener un formulario de suscripción por email,  
> para construir mi lista de contactos y comunicarme con mis clientes.

**Criterios de aceptación:**
- Puedo personalizar el título, subtítulo y texto del botón
- El formulario valida que el email tenga formato correcto
- Al enviar, el email queda registrado en la BD asociado al sitio
- El formulario muestra mensaje de éxito o error según el resultado
- Un email no puede suscribirse dos veces al mismo sitio (upsert)
