import { Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'

@Injectable()
export class NewsletterService {
  constructor(private readonly prisma: DatabaseService) {}

  async subscribe(siteId: string, email: string, source?: string) {
    const site = await this.prisma.site.findUnique({ where: { id: siteId } })
    if (!site) throw new NotFoundException('Sitio no encontrado')

    await this.prisma.newsletterSubscriber.upsert({
      where: { siteId_email: { siteId, email } },
      update: { isActive: true, source: source ?? undefined },
      create: { siteId, email, source: source ?? null, isActive: true },
    })

    return { success: true }
  }

  async getSubscribers(
    siteId: string,
    tenantId: string,
    { page = 1, limit = 50, active }: { page?: number; limit?: number; active?: boolean },
  ) {
    const site = await this.prisma.site.findFirst({ where: { id: siteId, tenantId } })
    if (!site) throw new NotFoundException('Sitio no encontrado')

    const where = {
      siteId,
      ...(active !== undefined ? { isActive: active } : {}),
    }

    const [data, total] = await Promise.all([
      this.prisma.newsletterSubscriber.findMany({
        where,
        select: { email: true, subscribedAt: true, isActive: true, source: true },
        orderBy: { subscribedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.newsletterSubscriber.count({ where }),
    ])

    return { data, total, page, limit }
  }

  async exportSubscribersCsv(siteId: string, tenantId: string): Promise<string> {
    const site = await this.prisma.site.findFirst({ where: { id: siteId, tenantId } })
    if (!site) throw new NotFoundException('Sitio no encontrado')

    const subscribers = await this.prisma.newsletterSubscriber.findMany({
      where: { siteId },
      select: { email: true, subscribedAt: true, isActive: true },
      orderBy: { subscribedAt: 'desc' },
    })

    const header = 'email,subscribedAt,isActive\n'
    const rows = subscribers
      .map((s: { email: string; subscribedAt: Date; isActive: boolean }) =>
        `${s.email},${s.subscribedAt.toISOString()},${s.isActive}`)
      .join('\n')

    return header + rows
  }

  async unsubscribe(siteId: string, email: string, token: string) {
    // Token simple en v1: base64 del email
    const expectedToken = Buffer.from(email).toString('base64')
    if (token !== expectedToken) {
      // Respuesta genérica — no revelar si el email existe o no
      return { success: true }
    }

    await this.prisma.newsletterSubscriber.updateMany({
      where: { siteId, email },
      data: { isActive: false },
    })

    return { success: true }
  }
}
