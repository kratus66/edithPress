import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DatabaseService } from '../database/database.service'
import type { ContactFormDto } from './dto/contact-form.dto'

/**
 * RendererService — endpoints públicos para el renderer Next.js.
 *
 * SEGURIDAD: No requiere JWT. Sólo expone datos de sitios publicados.
 * Nunca expone: passwordHash, stripeCustomerId, tokens internos.
 */
@Injectable()
export class RendererService {
  private readonly logger = new Logger(RendererService.name)

  constructor(
    private readonly db: DatabaseService,
    private readonly config: ConfigService,
  ) {}

  // ────────────────────────────────────── GET TENANT INFO ──

  /**
   * Retorna la info del tenant y su sitio publicado, incluyendo
   * la navegación (páginas publicadas ordenadas por `order`).
   *
   * Usado por el renderer para: metadatos de la página, nav links,
   * favicon, colores globales y settings SEO.
   */
  async getTenantInfo(slug: string) {
    const tenant = await this.db.tenant.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        isActive: true,
        sites: {
          where: { isPublished: true },
          take: 1,
          select: {
            id: true,
            name: true,
            description: true,
            favicon: true,
            settings: true,
            pages: {
              where: { status: 'PUBLISHED' },
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                slug: true,
                isHomepage: true,
                metaTitle: true,
                metaDesc: true,
                ogImage: true,
              },
            },
          },
        },
      },
    })

    if (!tenant || !tenant.isActive) {
      throw new NotFoundException({
        code: 'TENANT_NOT_FOUND',
        message: 'Sitio no encontrado',
      })
    }

    const site = tenant.sites[0]
    if (!site) {
      throw new NotFoundException({
        code: 'SITE_NOT_PUBLISHED',
        message: 'El sitio no está publicado',
      })
    }

    return {
      tenant: {
        name: tenant.name,
        slug: tenant.slug,
        logoUrl: tenant.logoUrl,
      },
      site: {
        id: site.id,
        name: site.name,
        description: site.description,
        favicon: site.favicon,
        settings: site.settings,
      },
      navigation: site.pages,
    }
  }

  // ────────────────────────────────────── GET PAGE CONTENT ──

  /**
   * Retorna el contenido completo de una página publicada.
   * El pageSlug "index" mapea a la homepage si existe,
   * de lo contrario busca por slug exacto.
   *
   * El `content` es el JSON del page builder que el renderer
   * convierte en componentes React.
   */
  async getPage(tenantSlug: string, pageSlug: string) {
    // Primero obtenemos el siteId del tenant publicado
    const tenant = await this.db.tenant.findUnique({
      where: { slug: tenantSlug },
      select: {
        isActive: true,
        sites: {
          where: { isPublished: true },
          take: 1,
          select: { id: true },
        },
      },
    })

    if (!tenant?.isActive || !tenant.sites[0]) {
      throw new NotFoundException({
        code: 'SITE_NOT_PUBLISHED',
        message: 'Sitio no encontrado o no publicado',
      })
    }

    const siteId = tenant.sites[0].id

    // Buscamos la página: slug exacto o homepage si slug es "index"
    const whereSlug =
      pageSlug === 'index'
        ? { siteId, isHomepage: true, status: 'PUBLISHED' as const }
        : { siteId, slug: pageSlug, status: 'PUBLISHED' as const }

    const page = await this.db.page.findFirst({
      where: whereSlug,
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        metaTitle: true,
        metaDesc: true,
        ogImage: true,
        isHomepage: true,
        publishedAt: true,
        updatedAt: true,
      },
    })

    if (!page) {
      throw new NotFoundException({
        code: 'PAGE_NOT_FOUND',
        message: 'Página no encontrada',
      })
    }

    return {
      page: {
        id: page.id,
        title: page.title,
        slug: page.slug,
        content: page.content,
        meta: {
          title: page.metaTitle ?? page.title,
          description: page.metaDesc,
          ogImage: page.ogImage,
        },
        isHomepage: page.isHomepage,
        publishedAt: page.publishedAt,
        updatedAt: page.updatedAt,
      },
    }
  }

  // ────────────────────────────────────── CONTACT FORM ──

  /**
   * Envía el formulario de contacto al email del OWNER del tenant.
   *
   * Flujo:
   * 1. Valida que el slug corresponde a un tenant activo y publicado
   * 2. Busca el email del OWNER (primer TenantUser con role OWNER)
   * 3. Envía email via Resend
   *
   * Si Resend no está configurado (dev local), loguea y retorna OK
   * para no bloquear el desarrollo.
   */
  async sendContactForm(tenantSlug: string, dto: ContactFormDto) {
    // 1. Verificar tenant activo con sitio publicado
    const tenant = await this.db.tenant.findUnique({
      where: { slug: tenantSlug },
      select: {
        id: true,
        name: true,
        isActive: true,
        sites: {
          where: { isPublished: true },
          take: 1,
          select: { id: true },
        },
        tenantUsers: {
          where: { role: 'OWNER' },
          take: 1,
          select: {
            user: {
              select: { email: true, firstName: true },
            },
          },
        },
      },
    })

    if (!tenant?.isActive || !tenant.sites[0]) {
      throw new NotFoundException({
        code: 'TENANT_NOT_FOUND',
        message: 'Sitio no encontrado',
      })
    }

    const ownerUser = tenant.tenantUsers[0]?.user
    if (!ownerUser) {
      this.logger.warn(`Tenant ${tenantSlug} no tiene OWNER asignado`)
      throw new BadRequestException({
        code: 'OWNER_NOT_FOUND',
        message: 'No se pudo procesar el formulario',
      })
    }

    // 2. Enviar email via Resend
    const resendApiKey = this.config.get<string>('RESEND_API_KEY')
    const fromEmail = this.config.get<string>('RESEND_FROM_EMAIL') ?? 'noreply@edithpress.com'

    if (!resendApiKey) {
      // En desarrollo, solo loguear
      this.logger.warn(
        `[DEV] Contacto recibido para ${tenantSlug}: from=${dto.email} name=${dto.name}`,
      )
      return { success: true }
    }

    try {
      const { Resend } = await import('resend')
      const resend = new Resend(resendApiKey)

      await resend.emails.send({
        from: fromEmail,
        to: ownerUser.email,
        reply_to: dto.email,
        subject: `Nuevo mensaje de contacto — ${tenant.name}`,
        html: buildContactEmailHtml({
          ownerName: ownerUser.firstName ?? 'propietario',
          visitorName: dto.name,
          visitorEmail: dto.email,
          message: dto.message,
          siteName: tenant.name,
        }),
      })

      this.logger.log(
        `Contacto enviado: tenant=${tenantSlug} to=${ownerUser.email}`,
      )
    } catch (err) {
      this.logger.error('Error enviando email de contacto', err)
      throw new ServiceUnavailableException({
        code: 'EMAIL_SEND_FAILED',
        message: 'No se pudo enviar el mensaje. Inténtalo de nuevo.',
      })
    }

    return { success: true }
  }
}

// ────────────────────────────────────── EMAIL TEMPLATE ──

function buildContactEmailHtml(params: {
  ownerName: string
  visitorName: string
  visitorEmail: string
  message: string
  siteName: string
}): string {
  const { ownerName, visitorName, visitorEmail, message, siteName } = params
  // Se escapa el contenido del usuario para prevenir HTML injection en el email
  const safe = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#111827">Nuevo mensaje de contacto</h2>
      <p style="color:#374151">Hola <strong>${safe(ownerName)}</strong>,</p>
      <p style="color:#374151">
        Recibiste un mensaje desde el formulario de contacto de <strong>${safe(siteName)}</strong>.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:24px 0">
        <tr>
          <td style="padding:8px 12px;background:#f3f4f6;font-weight:600;width:120px">Nombre</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${safe(visitorName)}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;background:#f3f4f6;font-weight:600">Email</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${safe(visitorEmail)}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;background:#f3f4f6;font-weight:600;vertical-align:top">Mensaje</td>
          <td style="padding:8px 12px;white-space:pre-wrap">${safe(message)}</td>
        </tr>
      </table>
      <p style="color:#6b7280;font-size:0.875rem">
        Responde directamente a este email para contactar al visitante.
      </p>
    </div>
  `
}
