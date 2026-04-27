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
            { type: 'NavbarBlock', props: {} },
            { type: 'HeroBlock', props: {} },
            { type: 'CategoryGridBlock', props: {} },
            { type: 'ProductGridBlock', props: {} },
            { type: 'SplitContentBlock', props: {} },
            { type: 'StatsBlock', props: {} },
            { type: 'NewsletterBlock', props: {} },
            { type: 'FooterBlock', props: {} },
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
            { type: 'NavbarBlock', props: {} },
            { type: 'HeroBlock', props: {} },
            { type: 'GalleryBlock', props: {} },
            { type: 'SplitContentBlock', props: {} },
            { type: 'StatsBlock', props: {} },
            { type: 'FooterBlock', props: {} },
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
            { type: 'NavbarBlock', props: {} },
            { type: 'HeroBlock', props: {} },
            { type: 'CategoryGridBlock', props: {} },
            { type: 'SplitContentBlock', props: {} },
            { type: 'ContactFormBlock', props: {} },
            { type: 'FooterBlock', props: {} },
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
            { type: 'NavbarBlock', props: {} },
            { type: 'HeroBlock', props: {} },
            { type: 'CardGridBlock', props: {} },
            { type: 'StatsBlock', props: {} },
            { type: 'NewsletterBlock', props: {} },
            { type: 'FooterBlock', props: {} },
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
            { type: 'NavbarBlock', props: {} },
            { type: 'HeroBlock', props: {} },
            { type: 'SplitContentBlock', props: {} },
            { type: 'StatsBlock', props: {} },
            { type: 'NewsletterBlock', props: {} },
            { type: 'FooterBlock', props: {} },
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
