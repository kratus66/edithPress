import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// ── Contenido base de bloques Puck ─────────────────────────────────────────
const hero = (title: string, subtitle: string) => ({
  type: 'HeroBlock',
  props: { title, subtitle, ctaText: 'Comenzar', ctaUrl: '#', backgroundColor: '#1a1a2e', backgroundImage: '' },
})

const text = (content: string) => ({
  type: 'TextBlock',
  props: { content: `<p>${content}</p>` },
})

const cardGrid = (cards: { title: string; description: string }[]) => ({
  type: 'CardGridBlock',
  props: {
    columns: 3,
    cards: cards.map((c) => ({ title: c.title, description: c.description, imageUrl: '', link: '#' })),
  },
})

const button = (label: string, url = '#') => ({
  type: 'ButtonBlock',
  props: { label, url, variant: 'primary' },
})

const gallery = (count = 4) => ({
  type: 'GalleryBlock',
  props: { columns: 2, images: Array.from({ length: count }, (_, i) => ({ src: '', alt: `Imagen ${i + 1}` })) },
})

const contactForm = (title = 'Contáctanos') => ({
  type: 'ContactFormBlock',
  props: { title, submitLabel: 'Enviar mensaje' },
})

const imageBlock = (alt = 'Imagen') => ({
  type: 'ImageBlock',
  props: { src: '', alt, caption: '' },
})

const separator = () => ({
  type: 'SeparatorBlock',
  props: { style: 'solid', color: '#e5e7eb', margin: '32px' },
})

// ── Templates ────────────────────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: 'tpl-landing-startup',
    name: 'Landing Startup',
    description: 'Página de aterrizaje perfecta para startups y productos SaaS.',
    category: 'landing',
    sortOrder: 1,
    content: [
      hero('Tu producto, en minutos', 'La forma más rápida de lanzar tu idea al mundo.'),
      separator(),
      cardGrid([
        { title: 'Fácil de usar', description: 'Sin conocimientos técnicos requeridos.' },
        { title: 'Rápido', description: 'Tu sitio en línea en menos de 5 minutos.' },
        { title: 'Seguro', description: 'SSL incluido en todos los planes.' },
      ]),
      separator(),
      text('Únete a miles de emprendedores que ya confían en nosotros para crecer en línea.'),
      button('Empezar gratis', '#'),
    ],
  },
  {
    id: 'tpl-landing-agencia',
    name: 'Landing Agencia',
    description: 'Presentación profesional para agencias de marketing y diseño.',
    category: 'landing',
    sortOrder: 2,
    content: [
      hero('Hacemos crecer tu negocio', 'Estrategia, diseño y resultados medibles.'),
      separator(),
      gallery(4),
      separator(),
      contactForm('¿Hablamos de tu proyecto?'),
    ],
  },
  {
    id: 'tpl-portfolio-creativo',
    name: 'Portfolio Creativo',
    description: 'Muestra tu trabajo con estilo. Ideal para diseñadores y artistas.',
    category: 'portfolio',
    sortOrder: 3,
    content: [
      hero('Mi trabajo', 'Diseñador visual con pasión por crear experiencias memorables.'),
      separator(),
      gallery(6),
      separator(),
      text('Trabajo con marcas que quieren destacar. Cuéntame tu proyecto.'),
    ],
  },
  {
    id: 'tpl-portfolio-fotografo',
    name: 'Portfolio Fotógrafo',
    description: 'Galería minimalista para fotógrafos profesionales.',
    category: 'portfolio',
    sortOrder: 4,
    content: [
      hero('Fotografía', 'Capturo momentos que perduran para siempre.'),
      separator(),
      gallery(8),
      separator(),
      button('Ver sesiones disponibles', '#'),
    ],
  },
  {
    id: 'tpl-restaurante',
    name: 'Restaurante',
    description: 'Página para restaurantes y negocios de gastronomía.',
    category: 'restaurante',
    sortOrder: 5,
    content: [
      hero('Bienvenidos a nuestra mesa', 'Sabores auténticos preparados con amor.'),
      separator(),
      text('Abrimos de lunes a domingo, de 12:00 a 23:00. Reservas con 24 horas de anticipación.'),
      imageBlock('Nuestro restaurante'),
      separator(),
      contactForm('Haz tu reserva'),
    ],
  },
  {
    id: 'tpl-tienda-local',
    name: 'Tienda Local',
    description: 'Presenta tu negocio local y productos destacados.',
    category: 'negocio',
    sortOrder: 6,
    content: [
      hero('Tu tienda de confianza', 'Los mejores productos a tu alcance.'),
      separator(),
      cardGrid([
        { title: 'Producto 1', description: 'Descripción breve del producto.' },
        { title: 'Producto 2', description: 'Descripción breve del producto.' },
        { title: 'Producto 3', description: 'Descripción breve del producto.' },
      ]),
      separator(),
      contactForm('¿Alguna pregunta?'),
    ],
  },
  {
    id: 'tpl-blog-personal',
    name: 'Blog Personal',
    description: 'Comparte tus ideas y reflexiones con el mundo.',
    category: 'blog',
    sortOrder: 7,
    content: [
      hero('Mi Blog', 'Pensamientos, ideas y aprendizajes sobre tecnología y vida.'),
      separator(),
      text('Bienvenido a mi espacio personal. Aquí escribo sobre lo que aprendo cada día.'),
      separator(),
      cardGrid([
        { title: 'Artículo reciente', description: 'Un resumen del artículo más reciente del blog.' },
        { title: 'Lo más leído', description: 'El artículo que más resonó con mis lectores.' },
        { title: 'Sobre mí', description: 'Quién soy y por qué escribo este blog.' },
      ]),
    ],
  },
  {
    id: 'tpl-consultoria',
    name: 'Consultoría',
    description: 'Presenta tus servicios de consultoría de forma profesional.',
    category: 'negocio',
    sortOrder: 8,
    content: [
      hero('Expertos en lo que hacemos', 'Consultoría estratégica para empresas en crecimiento.'),
      separator(),
      cardGrid([
        { title: 'Estrategia', description: 'Definimos el camino hacia tus objetivos.' },
        { title: 'Ejecución', description: 'Te acompañamos en cada paso del proceso.' },
        { title: 'Resultados', description: 'Medimos y optimizamos el impacto.' },
      ]),
      separator(),
      text('Más de 10 años de experiencia ayudando a empresas a crecer de forma sostenible.'),
      button('Agenda una sesión gratuita', '#'),
    ],
  },
  {
    id: 'tpl-educacion',
    name: 'Educación',
    description: 'Para instituciones educativas, cursos y programas de formación.',
    category: 'educacion',
    sortOrder: 9,
    content: [
      hero('Aprende con los mejores', 'Programas diseñados para transformar tu carrera.'),
      separator(),
      cardGrid([
        { title: 'Curso 1', description: 'Descripción y duración del curso.' },
        { title: 'Curso 2', description: 'Descripción y duración del curso.' },
        { title: 'Curso 3', description: 'Descripción y duración del curso.' },
      ]),
      separator(),
      text('Más de 5,000 estudiantes han transformado su carrera con nuestros programas.'),
      button('Ver todos los cursos', '#'),
    ],
  },
  {
    id: 'tpl-blank',
    name: 'Página en Blanco',
    description: 'Empieza desde cero con total libertad creativa.',
    category: 'basico',
    sortOrder: 0,
    content: [],
  },
  // ── Sprint 04 templates ──────────────────────────────────────────────────
  {
    id: 'template-tienda-artesanal',
    name: 'Tienda Artesanal',
    description: 'Perfecta para tiendas con identidad visual fuerte y catálogo de productos artesanales',
    category: 'ecommerce',
    sortOrder: 10,
    thumbnailUrl: 'https://placehold.co/400x300/8B6914/ffffff?text=Tienda+Artesanal',
    content: {
      pages: [
        {
          title: 'Inicio',
          slug: '',
          isHomepage: true,
          content: [
            { type: 'NavbarBlock', props: { logoText: '', logoLines: [{ text: 'Tienda Artesanal', size: 'lg', weight: 'semibold', spacing: 'tight', transform: 'none', color: '#b45309', fontFamily: '' }], logoImageUrl: '', navLinks: [{ label: 'Inicio', url: '/' }, { label: 'Productos', url: '/productos' }, { label: 'Nosotros', url: '/nosotros' }, { label: 'Contacto', url: '/contacto' }], backgroundColor: '#ffffff', textColor: '#1e293b', accentColor: '#b45309', sticky: true, showSearch: true, showCart: false, layout: 'logo-left', navFontWeight: 'medium', navFontFamily: '', borderStyle: 'shadow' } },
            { type: 'HeroBlock', props: { title: 'Artesanía con historia', titleHtml: '', subtitle: 'Productos únicos hechos a mano por artesanos locales.', subtitleHtml: '', backgroundColor: '#1a0f00', textColor: '#f5f0e8', imageConfig: { src: '', position: 'right' }, buttons: [{ text: 'Ver productos', url: '/productos', variant: 'solid', bgColor: '#b45309', textColor: '#ffffff' }], textAlign: 'left', paddingY: 'xl', fontFamily: '', eyebrowText: 'COLECCIÓN 2024', eyebrowStyles: { fontSize: 'sm', fontWeight: 'semibold', color: '#c4622d', letterSpacing: 'wider', textTransform: 'uppercase' }, titleStyles: { fontSize: 'xl', fontWeight: 'bold', color: '#f5f0e8', letterSpacing: 'tight' }, subtitleStyles: { fontSize: 'lg', fontWeight: 'light', color: '#f5f0e8', opacity: 80, lineHeight: 'relaxed' } } },
            { type: 'CategoryGridBlock', props: { eyebrowText: 'NUESTRAS CATEGORÍAS', title: 'Explora por tipo de artesanía', columns: 4, categories: [{ image: 'https://placehold.co/400x500/8B6914/ffffff?text=Mochilas', imageAlt: 'Mochilas', name: 'Mochilas', description: 'Tejidas a mano', url: '#' }, { image: 'https://placehold.co/400x500/7c3f00/ffffff?text=Cerámica', imageAlt: 'Cerámica', name: 'Cerámica', description: 'Técnicas ancestrales', url: '#' }, { image: 'https://placehold.co/400x500/a0522d/ffffff?text=Joyería', imageAlt: 'Joyería', name: 'Joyería', description: 'Materiales naturales', url: '#' }, { image: 'https://placehold.co/400x500/8B6914/ffffff?text=Textiles', imageAlt: 'Textiles', name: 'Textiles', description: 'Bordados únicos', url: '#' }], cardAspectRatio: 'portrait', overlayColor: '#000000', overlayOpacity: 60, gradientDirection: 'bottom-top', hoverEffect: 'zoom', textPosition: 'bottom', backgroundColor: '#f5f0e8', textColor: '#1a0f00', accentColor: '#7c3f00' } },
            { type: 'ProductGridBlock', props: { title: 'Nuestros Productos', subtitle: '', columns: 3, products: [{ image: 'https://placehold.co/400x300/e2e8f0/64748b?text=Producto+1', imageAlt: 'Producto 1', category: 'Mochilas', name: 'Mochila Wayuu Premium', description: 'Tejida a mano con hilos de colores vibrantes.', price: '$85.000', artisan: 'María López', ctaText: 'Ver producto', ctaUrl: '#' }, { image: 'https://placehold.co/400x300/e2e8f0/64748b?text=Producto+2', imageAlt: 'Producto 2', category: 'Cerámica', name: 'Vasija Decorativa', description: 'Elaborada con arcilla local y pintada a mano.', price: '$45.000', artisan: 'Juan Pérez', ctaText: 'Ver producto', ctaUrl: '#' }, { image: 'https://placehold.co/400x300/e2e8f0/64748b?text=Producto+3', imageAlt: 'Producto 3', category: 'Joyería', name: 'Collar de Semillas', description: 'Semillas naturales combinadas con piedras del río.', price: '$35.000', artisan: 'Ana García', ctaText: 'Ver producto', ctaUrl: '#' }], backgroundColor: '#ffffff', textColor: '#1e293b', accentColor: '#b45309', cardStyle: 'shadow', whatsappPhone: '', eyebrowText: '', viewAllText: 'Ver todos', viewAllUrl: '#', categoryPosition: 'badge', showCta: true } },
            { type: 'SplitContentBlock', props: { eyebrowText: 'NUESTRA HISTORIA', title: 'Preservando la tradición', body: 'Trabajamos con comunidades artesanales locales.\nCada pieza es única, elaborada con técnicas ancestrales.', imagePosition: 'left', imageLayout: 'collage', images: [{ src: 'https://placehold.co/400x400/8B6914/ffffff?text=Artesanos+1', alt: 'Artesanos trabajando' }, { src: 'https://placehold.co/400x400/7c3f00/ffffff?text=Artesanos+2', alt: 'Artesanía' }], stats: [{ value: '50+', label: 'Artesanos' }, { value: '500+', label: 'Productos' }], ctaText: 'Conoce nuestra historia', ctaUrl: '#', ctaVariant: 'solid', backgroundColor: '#f5f0e8', textColor: '#1a0f00', accentColor: '#c4622d', gap: 'lg' } },
            { type: 'StatsBlock', props: { stats: [{ value: '50+', label: 'Artesanos', icon: '🎨' }, { value: '200+', label: 'Productos', icon: '📦' }, { value: '15', label: 'Años', icon: '⭐' }, { value: '100%', label: 'Hecho a mano', icon: '✋' }], backgroundColor: '#f8f4ef', textColor: '#1e293b', accentColor: '#b45309', layout: 'row-with-dividers', padding: 'md' } },
            { type: 'NewsletterBlock', props: { title: 'Únete a nuestra comunidad', subtitle: 'Recibe noticias sobre nuevos productos y artesanos.', placeholder: 'tu@email.com', buttonText: 'Suscribirme', successMessage: '¡Gracias! Te avisaremos de novedades.', backgroundColor: '#1a0f00', textColor: '#f5f0e8', accentColor: '#c4622d', layout: 'centered' } },
            { type: 'FooterBlock', props: { logoText: 'Tienda Artesanal', logoSubtext: '', logoImageUrl: '', tagline: 'Artesanía con historia y tradición.', contactEmail: 'contacto@tienda.com', contactPhone: '', contactAddress: '', socialLinks: [{ platform: 'instagram', url: '#' }, { platform: 'facebook', url: '#' }], columns: [{ heading: 'TIENDA', links: [{ label: 'Todos los productos', url: '#' }, { label: 'Novedades', url: '#' }] }, { heading: 'EMPRESA', links: [{ label: 'Sobre nosotros', url: '#' }, { label: 'Artesanos', url: '#' }] }], copyright: '© 2024 Tienda Artesanal.', legalLinks: [{ label: 'Política de privacidad', url: '#' }], backgroundColor: '#1a0f00', textColor: '#f5f0e8', accentColor: '#c4622d', showNewsletter: false, newsletterTitle: '', newsletterSubtitle: '' } },
          ],
        },
      ],
    },
  },
  {
    id: 'template-portfolio-creativo',
    name: 'Portfolio Creativo',
    description: 'Ideal para fotógrafos, diseñadores y artistas que quieren mostrar su trabajo',
    category: 'portfolio',
    sortOrder: 11,
    thumbnailUrl: 'https://placehold.co/400x300/1a1a2e/ffffff?text=Portfolio+Creativo',
    content: {
      pages: [
        {
          title: 'Inicio',
          slug: '',
          isHomepage: true,
          content: [
            { type: 'NavbarBlock', props: { logoText: '', logoLines: [{ text: 'Mi Portfolio', size: 'lg', weight: 'semibold', spacing: 'tight', transform: 'none', color: '#7c3aed', fontFamily: '' }], logoImageUrl: '', navLinks: [{ label: 'Trabajo', url: '/' }, { label: 'Sobre mí', url: '/sobre-mi' }, { label: 'Contacto', url: '/contacto' }], backgroundColor: '#0f0f1a', textColor: '#e2e8f0', accentColor: '#7c3aed', sticky: true, showSearch: false, showCart: false, layout: 'logo-left', navFontWeight: 'regular', navFontFamily: '', borderStyle: 'none' } },
            { type: 'HeroBlock', props: { title: 'Diseño que inspira', titleHtml: '', subtitle: 'Creativo visual con pasión por experiencias memorables.', subtitleHtml: '', backgroundColor: '#0f0f1a', textColor: '#e2e8f0', imageConfig: { src: '', position: 'right' }, buttons: [{ text: 'Ver mi trabajo', url: '#galeria', variant: 'outline', bgColor: 'transparent', textColor: '#7c3aed' }], textAlign: 'center', paddingY: 'xl', fontFamily: '', eyebrowText: 'PORTFOLIO', eyebrowStyles: { fontSize: 'sm', fontWeight: 'semibold', color: '#7c3aed', letterSpacing: 'wider', textTransform: 'uppercase' }, titleStyles: { fontSize: 'xxl', fontWeight: 'bold', color: '#e2e8f0', letterSpacing: 'tight' }, subtitleStyles: { fontSize: 'lg', fontWeight: 'light', color: '#e2e8f0', opacity: 70, lineHeight: 'relaxed' } } },
            { type: 'GalleryBlock', props: { columns: 3, images: [{ src: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=Proyecto+1', alt: 'Proyecto 1' }, { src: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=Proyecto+2', alt: 'Proyecto 2' }, { src: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=Proyecto+3', alt: 'Proyecto 3' }, { src: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=Proyecto+4', alt: 'Proyecto 4' }, { src: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=Proyecto+5', alt: 'Proyecto 5' }, { src: 'https://placehold.co/600x400/1a1a2e/7c3aed?text=Proyecto+6', alt: 'Proyecto 6' }], gap: 'sm', aspectRatio: 'landscape', enableLightbox: true, showCaption: false, borderRadius: 8, backgroundColor: '#0f0f1a' } },
            { type: 'SplitContentBlock', props: { eyebrowText: 'SOBRE MÍ', title: 'Diseñador visual creativo', body: 'Especializado en identidad de marca, UI/UX y fotografía.\nWork con marcas que quieren destacar y conectar con su audiencia.', imagePosition: 'right', imageLayout: 'single', images: [{ src: 'https://placehold.co/400x500/1a1a2e/7c3aed?text=Foto', alt: 'Mi foto' }], stats: [{ value: '5+', label: 'Años' }, { value: '80+', label: 'Proyectos' }], ctaText: 'Hablemos', ctaUrl: '/contacto', ctaVariant: 'solid', backgroundColor: '#0f0f1a', textColor: '#e2e8f0', accentColor: '#7c3aed', gap: 'lg' } },
            { type: 'StatsBlock', props: { stats: [{ value: '80+', label: 'Proyectos', icon: '🎨' }, { value: '50+', label: 'Clientes', icon: '🤝' }, { value: '5', label: 'Años', icon: '⭐' }, { value: '12', label: 'Premios', icon: '🏆' }], backgroundColor: '#1a1a2e', textColor: '#e2e8f0', accentColor: '#7c3aed', layout: 'row-with-dividers', padding: 'md' } },
            { type: 'FooterBlock', props: { logoText: 'Mi Portfolio', logoSubtext: '', logoImageUrl: '', tagline: 'Diseño con propósito.', contactEmail: 'hola@portfolio.com', contactPhone: '', contactAddress: '', socialLinks: [{ platform: 'instagram', url: '#' }, { platform: 'behance', url: '#' }], columns: [], copyright: '© 2024 Mi Portfolio.', legalLinks: [], backgroundColor: '#0f0f1a', textColor: '#e2e8f0', accentColor: '#7c3aed', showNewsletter: false, newsletterTitle: '', newsletterSubtitle: '' } },
          ],
        },
      ],
    },
  },
  {
    id: 'template-restaurante',
    name: 'Restaurante',
    description: 'Diseñada para restaurantes y negocios gastronómicos con menú visual',
    category: 'restaurant',
    sortOrder: 12,
    thumbnailUrl: 'https://placehold.co/400x300/c0392b/ffffff?text=Restaurante',
    content: {
      pages: [
        {
          title: 'Inicio',
          slug: '',
          isHomepage: true,
          content: [
            { type: 'NavbarBlock', props: { logoText: '', logoLines: [{ text: 'Restaurante', size: 'xl', weight: 'bold', spacing: 'tight', transform: 'none', color: '#c0392b', fontFamily: '' }], logoImageUrl: '', navLinks: [{ label: 'Menú', url: '/' }, { label: 'Nosotros', url: '/nosotros' }, { label: 'Reservas', url: '/contacto' }], backgroundColor: '#1c0a00', textColor: '#f5e6d0', accentColor: '#c0392b', sticky: true, showSearch: false, showCart: false, layout: 'logo-left', navFontWeight: 'medium', navFontFamily: '', borderStyle: 'border' } },
            { type: 'HeroBlock', props: { title: 'Sabores auténticos', titleHtml: '', subtitle: 'Preparados con amor desde 1995. Reserva tu mesa hoy.', subtitleHtml: '', backgroundColor: '#1c0a00', textColor: '#f5e6d0', imageConfig: { src: 'https://placehold.co/800x600/c0392b/ffffff?text=Restaurante', position: 'right' }, buttons: [{ text: 'Reservar mesa', url: '/contacto', variant: 'solid', bgColor: '#c0392b', textColor: '#ffffff' }, { text: 'Ver menú', url: '#menu', variant: 'outline', bgColor: 'transparent', textColor: '#f5e6d0' }], textAlign: 'left', paddingY: 'xl', fontFamily: '', eyebrowText: 'COCINA TRADICIONAL', eyebrowStyles: { fontSize: 'sm', fontWeight: 'semibold', color: '#e67e22', letterSpacing: 'wider', textTransform: 'uppercase' }, titleStyles: { fontSize: 'xl', fontWeight: 'bold', color: '#f5e6d0', letterSpacing: 'tight' }, subtitleStyles: { fontSize: 'md', fontWeight: 'regular', color: '#f5e6d0', opacity: 80, lineHeight: 'relaxed' } } },
            { type: 'CategoryGridBlock', props: { eyebrowText: 'NUESTRO MENÚ', title: 'Explora nuestros platos', columns: 3, categories: [{ image: 'https://placehold.co/400x400/c0392b/ffffff?text=Entradas', imageAlt: 'Entradas', name: 'Entradas', description: 'Delicias para comenzar', url: '#' }, { image: 'https://placehold.co/400x400/e67e22/ffffff?text=Platos', imageAlt: 'Platos', name: 'Platos Principales', description: 'Sabores auténticos', url: '#' }, { image: 'https://placehold.co/400x400/8e44ad/ffffff?text=Postres', imageAlt: 'Postres', name: 'Postres', description: 'Dulce final perfecto', url: '#' }], cardAspectRatio: 'square', overlayColor: '#000000', overlayOpacity: 50, gradientDirection: 'bottom-top', hoverEffect: 'zoom', textPosition: 'bottom', backgroundColor: '#fff8f0', textColor: '#1c0a00', accentColor: '#c0392b' } },
            { type: 'SplitContentBlock', props: { eyebrowText: 'NUESTRA HISTORIA', title: 'Tradición en cada plato', body: 'Más de 25 años sirviendo a familias y amigos.\nUsamos ingredientes frescos de productores locales.', imagePosition: 'right', imageLayout: 'single', images: [{ src: 'https://placehold.co/600x400/c0392b/ffffff?text=Cocina', alt: 'Nuestra cocina' }], stats: [{ value: '25+', label: 'Años' }, { value: '100+', label: 'Recetas' }], ctaText: 'Nuestra historia', ctaUrl: '/nosotros', ctaVariant: 'solid', backgroundColor: '#fff8f0', textColor: '#1c0a00', accentColor: '#c0392b', gap: 'lg' } },
            { type: 'ContactFormBlock', props: { title: 'Reserva tu mesa', subtitle: 'Te confirmaremos en menos de 24 horas.', submitLabel: 'Reservar', backgroundColor: '#1c0a00', textColor: '#f5e6d0', accentColor: '#c0392b' } },
            { type: 'FooterBlock', props: { logoText: 'Restaurante', logoSubtext: '', logoImageUrl: '', tagline: 'Sabores que perduran.', contactEmail: 'reservas@restaurante.com', contactPhone: '+1 234 567 890', contactAddress: 'Calle Principal 123', socialLinks: [{ platform: 'instagram', url: '#' }, { platform: 'facebook', url: '#' }], columns: [{ heading: 'HORARIOS', links: [{ label: 'Lun-Vie: 12:00 - 23:00', url: '#' }, { label: 'Sáb-Dom: 12:00 - 24:00', url: '#' }] }], copyright: '© 2024 Restaurante.', legalLinks: [], backgroundColor: '#1c0a00', textColor: '#f5e6d0', accentColor: '#c0392b', showNewsletter: false, newsletterTitle: '', newsletterSubtitle: '' } },
          ],
        },
      ],
    },
  },
  {
    id: 'template-agencia-servicios',
    name: 'Agencia de Servicios',
    description: 'Para agencias, consultoras y negocios que ofrecen servicios profesionales',
    category: 'services',
    sortOrder: 13,
    thumbnailUrl: 'https://placehold.co/400x300/2c3e50/ffffff?text=Agencia',
    content: {
      pages: [
        {
          title: 'Inicio',
          slug: '',
          isHomepage: true,
          content: [
            { type: 'NavbarBlock', props: { logoText: '', logoLines: [{ text: 'Mi Agencia', size: 'lg', weight: 'bold', spacing: 'normal', transform: 'none', color: '#2980b9', fontFamily: '' }], logoImageUrl: '', navLinks: [{ label: 'Servicios', url: '/' }, { label: 'Nosotros', url: '/nosotros' }, { label: 'Casos de éxito', url: '/casos' }, { label: 'Contacto', url: '/contacto' }], backgroundColor: '#ffffff', textColor: '#2c3e50', accentColor: '#2980b9', sticky: true, showSearch: false, showCart: false, layout: 'logo-left', navFontWeight: 'medium', navFontFamily: '', borderStyle: 'shadow' } },
            { type: 'HeroBlock', props: { title: 'Hacemos crecer tu negocio', titleHtml: '', subtitle: 'Estrategia, ejecución y resultados medibles para tu empresa.', subtitleHtml: '', backgroundColor: '#2c3e50', textColor: '#ffffff', imageConfig: { src: '', position: 'right' }, buttons: [{ text: 'Ver servicios', url: '#servicios', variant: 'solid', bgColor: '#2980b9', textColor: '#ffffff' }, { text: 'Contactar', url: '/contacto', variant: 'outline', bgColor: 'transparent', textColor: '#ffffff' }], textAlign: 'left', paddingY: 'xl', fontFamily: '', eyebrowText: 'AGENCIA DIGITAL', eyebrowStyles: { fontSize: 'sm', fontWeight: 'semibold', color: '#3498db', letterSpacing: 'wider', textTransform: 'uppercase' }, titleStyles: { fontSize: 'xl', fontWeight: 'bold', color: '#ffffff', letterSpacing: 'tight' }, subtitleStyles: { fontSize: 'lg', fontWeight: 'regular', color: '#ffffff', opacity: 85, lineHeight: 'relaxed' } } },
            { type: 'CardGridBlock', props: { cards: [{ title: 'Estrategia Digital', description: 'Definimos el camino hacia tus objetivos de negocio.', imageUrl: '', link: '#', buttonText: 'Saber más' }, { title: 'Diseño & UX', description: 'Experiencias digitales que convierten visitantes en clientes.', imageUrl: '', link: '#', buttonText: 'Saber más' }, { title: 'Desarrollo Web', description: 'Soluciones técnicas robustas y escalables.', imageUrl: '', link: '#', buttonText: 'Saber más' }], columns: 3, gap: 'md', cardStyle: 'shadow', backgroundColor: '#f8fafc', textColor: '#2c3e50', accentColor: '#2980b9', showButton: true, buttonVariant: 'outline' } },
            { type: 'StatsBlock', props: { stats: [{ value: '150+', label: 'Clientes', icon: '🤝' }, { value: '8+', label: 'Años', icon: '⭐' }, { value: '300+', label: 'Proyectos', icon: '🚀' }, { value: '98%', label: 'Satisfacción', icon: '💯' }], backgroundColor: '#2980b9', textColor: '#ffffff', accentColor: '#f39c12', layout: 'row-with-dividers', padding: 'lg' } },
            { type: 'NewsletterBlock', props: { title: 'Mantente actualizado', subtitle: 'Tendencias y consejos para hacer crecer tu negocio.', placeholder: 'tu@empresa.com', buttonText: 'Suscribirme', successMessage: '¡Gracias! Recibirás nuestro próximo boletín.', backgroundColor: '#2c3e50', textColor: '#ffffff', accentColor: '#2980b9', layout: 'side-by-side' } },
            { type: 'FooterBlock', props: { logoText: 'Mi Agencia', logoSubtext: '', logoImageUrl: '', tagline: 'Tu crecimiento es nuestro negocio.', contactEmail: 'hola@agencia.com', contactPhone: '', contactAddress: '', socialLinks: [{ platform: 'linkedin', url: '#' }, { platform: 'twitter', url: '#' }], columns: [{ heading: 'SERVICIOS', links: [{ label: 'Estrategia', url: '#' }, { label: 'Diseño', url: '#' }, { label: 'Desarrollo', url: '#' }] }, { heading: 'EMPRESA', links: [{ label: 'Nosotros', url: '#' }, { label: 'Casos', url: '#' }, { label: 'Blog', url: '#' }] }], copyright: '© 2024 Mi Agencia.', legalLinks: [{ label: 'Privacidad', url: '#' }], backgroundColor: '#2c3e50', textColor: '#ecf0f1', accentColor: '#2980b9', showNewsletter: false, newsletterTitle: '', newsletterSubtitle: '' } },
          ],
        },
      ],
    },
  },
  {
    id: 'template-ong',
    name: 'ONG / Causa Social',
    description: 'Para organizaciones sin fines de lucro, fundaciones y causas sociales',
    category: 'nonprofit',
    sortOrder: 14,
    thumbnailUrl: 'https://placehold.co/400x300/27ae60/ffffff?text=ONG',
    content: {
      pages: [
        {
          title: 'Inicio',
          slug: '',
          isHomepage: true,
          content: [
            { type: 'NavbarBlock', props: { logoText: '', logoLines: [{ text: 'Fundación', size: 'lg', weight: 'semibold', spacing: 'normal', transform: 'none', color: '#27ae60', fontFamily: '' }], logoImageUrl: '', navLinks: [{ label: 'Inicio', url: '/' }, { label: 'Nuestra causa', url: '/causa' }, { label: 'Proyectos', url: '/proyectos' }, { label: 'Donar', url: '/donar' }], backgroundColor: '#ffffff', textColor: '#1e3a2f', accentColor: '#27ae60', sticky: true, showSearch: false, showCart: false, layout: 'logo-left', navFontWeight: 'medium', navFontFamily: '', borderStyle: 'shadow' } },
            { type: 'HeroBlock', props: { title: 'Juntos cambiamos vidas', titleHtml: '', subtitle: 'Apoya nuestra causa y sé parte del cambio que el mundo necesita.', subtitleHtml: '', backgroundColor: '#1e3a2f', textColor: '#ffffff', imageConfig: { src: '', position: 'right' }, buttons: [{ text: 'Donar ahora', url: '/donar', variant: 'solid', bgColor: '#27ae60', textColor: '#ffffff' }, { text: 'Conocer más', url: '/causa', variant: 'outline', bgColor: 'transparent', textColor: '#ffffff' }], textAlign: 'center', paddingY: 'xl', fontFamily: '', eyebrowText: 'ORGANIZACIÓN SIN FINES DE LUCRO', eyebrowStyles: { fontSize: 'sm', fontWeight: 'semibold', color: '#2ecc71', letterSpacing: 'wider', textTransform: 'uppercase' }, titleStyles: { fontSize: 'xl', fontWeight: 'bold', color: '#ffffff', letterSpacing: 'tight' }, subtitleStyles: { fontSize: 'lg', fontWeight: 'regular', color: '#ffffff', opacity: 85, lineHeight: 'relaxed' } } },
            { type: 'SplitContentBlock', props: { eyebrowText: 'NUESTRA MISIÓN', title: 'Por un mundo más justo', body: 'Trabajamos para garantizar el acceso a educación, salud y oportunidades.\nCada donación transforma vidas reales en comunidades vulnerables.', imagePosition: 'left', imageLayout: 'single', images: [{ src: 'https://placehold.co/600x400/27ae60/ffffff?text=Comunidad', alt: 'Comunidad' }], stats: [{ value: '10K+', label: 'Beneficiados' }, { value: '50+', label: 'Proyectos' }], ctaText: 'Ver nuestros proyectos', ctaUrl: '/proyectos', ctaVariant: 'solid', backgroundColor: '#f0faf4', textColor: '#1e3a2f', accentColor: '#27ae60', gap: 'lg' } },
            { type: 'StatsBlock', props: { stats: [{ value: '10K+', label: 'Personas beneficiadas', icon: '❤️' }, { value: '50+', label: 'Proyectos activos', icon: '🌱' }, { value: '15', label: 'Años de impacto', icon: '⭐' }, { value: '500+', label: 'Voluntarios', icon: '🙌' }], backgroundColor: '#27ae60', textColor: '#ffffff', accentColor: '#f39c12', layout: 'row-with-dividers', padding: 'lg' } },
            { type: 'NewsletterBlock', props: { title: 'Sé parte del cambio', subtitle: 'Recibe actualizaciones sobre nuestros proyectos e impacto.', placeholder: 'tu@email.com', buttonText: 'Unirme', successMessage: '¡Gracias! Nos alegra tenerte en nuestra comunidad.', backgroundColor: '#1e3a2f', textColor: '#ffffff', accentColor: '#27ae60', layout: 'centered' } },
            { type: 'FooterBlock', props: { logoText: 'Fundación', logoSubtext: '', logoImageUrl: '', tagline: 'Transformando vidas, construyendo futuro.', contactEmail: 'info@fundacion.org', contactPhone: '', contactAddress: '', socialLinks: [{ platform: 'instagram', url: '#' }, { platform: 'facebook', url: '#' }, { platform: 'twitter', url: '#' }], columns: [{ heading: 'CAUSAS', links: [{ label: 'Educación', url: '#' }, { label: 'Salud', url: '#' }, { label: 'Medio ambiente', url: '#' }] }], copyright: '© 2024 Fundación. Todos los derechos reservados.', legalLinks: [{ label: 'Transparencia', url: '#' }], backgroundColor: '#1e3a2f', textColor: '#e8f5e9', accentColor: '#27ae60', showNewsletter: false, newsletterTitle: '', newsletterSubtitle: '' } },
          ],
        },
      ],
    },
  },
]

async function main() {
  console.log('🌱 Seeding database...')

  // ==================== PLANES ====================
  const plans = await Promise.all([
    prisma.plan.upsert({
      where: { slug: 'starter' },
      update: {},
      create: {
        id: 'starter',
        name: 'Starter',
        slug: 'starter',
        priceMonthly: 9.99,
        priceYearly: 99.99,
        maxSites: 1,
        maxPages: 10,
        maxStorageGB: 1,
        hasCustomDomain: false,
        hasEcommerce: false,
        hasAnalytics: false,
        hasWhiteLabel: false,
      },
    }),
    prisma.plan.upsert({
      where: { slug: 'business' },
      update: {},
      create: {
        id: 'business',
        name: 'Business',
        slug: 'business',
        priceMonthly: 29.99,
        priceYearly: 299.99,
        maxSites: 5,
        maxPages: 100,
        maxStorageGB: 10,
        hasCustomDomain: true,
        hasEcommerce: false,
        hasAnalytics: true,
        hasWhiteLabel: false,
      },
    }),
    prisma.plan.upsert({
      where: { slug: 'pro' },
      update: {},
      create: {
        id: 'pro',
        name: 'Pro',
        slug: 'pro',
        priceMonthly: 79.99,
        priceYearly: 799.99,
        maxSites: 20,
        maxPages: -1,
        maxStorageGB: 50,
        hasCustomDomain: true,
        hasEcommerce: true,
        hasAnalytics: true,
        hasWhiteLabel: false,
      },
    }),
    prisma.plan.upsert({
      where: { slug: 'enterprise' },
      update: {},
      create: {
        id: 'enterprise',
        name: 'Enterprise',
        slug: 'enterprise',
        priceMonthly: 0,
        priceYearly: 0,
        maxSites: -1,
        maxPages: -1,
        maxStorageGB: 500,
        hasCustomDomain: true,
        hasEcommerce: true,
        hasAnalytics: true,
        hasWhiteLabel: true,
      },
    }),
  ])
  console.log(`✅ Plans: ${plans.map((p) => p.name).join(', ')}`)

  // ==================== SUPER ADMIN ====================
  const adminHash = await bcrypt.hash('Admin123!', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@edithpress.com' },
    update: {},
    create: {
      email: 'admin@edithpress.com',
      passwordHash: adminHash,
      firstName: 'Super',
      lastName: 'Admin',
      emailVerified: true,
      isActive: true,
    },
  })
  console.log(`✅ Super admin: ${admin.email}`)

  // ==================== TEMPLATES ====================
  for (const tpl of TEMPLATES) {
    await prisma.template.upsert({
      where: { id: tpl.id },
      update: { sortOrder: tpl.sortOrder },
      create: {
        id: tpl.id,
        name: tpl.name,
        description: tpl.description,
        category: tpl.category,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        content: tpl.content as any,
        thumbnailUrl: (tpl as any).thumbnailUrl ?? null,
        isPremium: false,
        isActive: true,
        sortOrder: tpl.sortOrder,
        usageCount: 0,
        tags: [],
      },
    })
  }
  console.log(`✅ Templates: ${TEMPLATES.length} created`)

  // ==================== TENANT DEMO ====================
  const demoHash = await bcrypt.hash('Demo123!', 12)

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@edithpress.com' },
    update: {},
    create: {
      email: 'demo@edithpress.com',
      passwordHash: demoHash,
      firstName: 'Demo',
      lastName: 'User',
      emailVerified: true,
      isActive: true,
    },
  })

  const demoTenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      id: 'demo-tenant',
      name: 'Demo Agency',
      slug: 'demo',
      planId: 'starter',
      isActive: true,
    },
  })

  await prisma.tenantUser.upsert({
    where: { tenantId_userId: { tenantId: demoTenant.id, userId: demoUser.id } },
    update: {},
    create: { tenantId: demoTenant.id, userId: demoUser.id, role: 'OWNER' },
  })

  const demoSite = await prisma.site.upsert({
    where: { id: 'demo-site' },
    update: {},
    create: {
      id: 'demo-site',
      tenantId: demoTenant.id,
      name: 'Demo Agency',
      description: 'Sitio de demostración de EdithPress',
      isPublished: true,
      templateId: 'tpl-landing-agencia',
    },
  })

  const agenciaTemplate = TEMPLATES.find((t) => t.id === 'tpl-landing-agencia')!

  await prisma.page.upsert({
    where: { siteId_slug: { siteId: demoSite.id, slug: '/' } },
    update: {},
    create: {
      siteId: demoSite.id,
      title: 'Inicio',
      slug: '/',
      isHomepage: true,
      status: 'PUBLISHED',
      content: agenciaTemplate.content,
      publishedAt: new Date(),
    },
  })

  await prisma.page.upsert({
    where: { siteId_slug: { siteId: demoSite.id, slug: '/nosotros' } },
    update: {},
    create: {
      siteId: demoSite.id,
      title: 'Nosotros',
      slug: '/nosotros',
      status: 'PUBLISHED',
      content: [
        hero('Quiénes somos', 'Un equipo apasionado por el diseño y los resultados.'),
        separator(),
        text('Somos una agencia con más de 10 años de experiencia ayudando a empresas a crecer en línea.'),
        imageBlock('Nuestro equipo'),
      ],
      publishedAt: new Date(),
    },
  })

  await prisma.page.upsert({
    where: { siteId_slug: { siteId: demoSite.id, slug: '/contacto' } },
    update: {},
    create: {
      siteId: demoSite.id,
      title: 'Contacto',
      slug: '/contacto',
      status: 'PUBLISHED',
      content: [
        hero('Hablemos', 'Cuéntanos tu proyecto y te respondemos en menos de 24 horas.'),
        separator(),
        contactForm('Escríbenos'),
      ],
      publishedAt: new Date(),
    },
  })

  console.log(`✅ Demo tenant: demo@edithpress.com / Demo123! → demo.edithpress.com`)
  console.log('🌱 Seeding complete.')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
