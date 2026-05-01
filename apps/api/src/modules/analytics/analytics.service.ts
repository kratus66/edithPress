import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common'
import { createHash } from 'node:crypto'
import type { Request } from 'express'
import { DatabaseService } from '../database/database.service'
import { RedisService } from '../redis/redis.service'
import type { CreatePageViewDto } from './dto/pageview.dto'
import type { AnalyticsPeriod } from './dto/analytics-query.dto'

const BOT_PATTERNS = ['bot', 'crawler', 'spider', 'slurp', 'mediapartners']

/** TTL de caché de analytics en Redis (5 minutos) */
const CACHE_TTL_SECONDS = 300

/** Mapa período → días */
const PERIOD_DAYS: Record<AnalyticsPeriod, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name)

  constructor(
    private readonly db: DatabaseService,
    private readonly redis: RedisService,
  ) {
    // SEC: IP_SALT vacío produce un hash sin sal — todos los hashes serían
    // reproducibles con solo la IP. Advertir en startup para forzar la config.
    if (!process.env['IP_SALT']) {
      this.logger.warn(
        'IP_SALT no configurado. Los hashes de IP no tendrán sal — configura IP_SALT en las variables de entorno.',
      )
    }
  }

  /**
   * Acceso tipado al modelo PageView.
   * Existe en el schema Sprint 03 — el cast se elimina tras
   * regenerar el Prisma client con `pnpm db:generate` en packages/database.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private get pageViewModel(): any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.db as any).pageView
  }

  // ────────────────────────────────────────── INGEST PAGEVIEW ──

  /**
   * Registra una visita a una página.
   *
   * GDPR: NO se guarda la IP del visitante.
   * El path se sanea (truncado a 500 chars) antes de guardar.
   * Se verifica que el siteId existe para evitar spam de datos huérfanos.
   */
  async trackPageView(dto: CreatePageViewDto, req: Request): Promise<void> {
    // Filtrar bots — no persistir visitas de crawlers
    const ua = (dto.userAgent ?? '').toLowerCase()
    if (BOT_PATTERNS.some((p) => ua.includes(p))) return

    // Verificar que el sitio existe y obtener tenantId
    const site = await this.db.site.findUnique({
      where: { id: dto.siteId },
      select: { id: true, tenantId: true },
    })

    if (!site) return // fire-and-forget: no lanzar, solo descartar

    // Generar ipHash — GDPR: nunca guardar la IP real
    const ip = (req.headers['x-real-ip'] as string | undefined) ?? req.ip ?? 'unknown'
    const salt = process.env['IP_SALT'] ?? ''
    const ipHash = createHash('sha256').update(ip + salt).digest('hex')

    // Sanitizar path — truncar y asegurar que empieza con /
    const path = (dto.path.startsWith('/') ? dto.path : `/${dto.path}`).slice(0, 500)

    await this.pageViewModel.create({
      data: {
        tenantId: site.tenantId,
        siteId: dto.siteId,
        path,
        ipHash,
        referrer: dto.referrer?.slice(0, 500) ?? null,
        userAgent: ua.slice(0, 500) || null,
      },
    })

    // Invalidar caché de analytics para este sitio (todas las ventanas)
    await Promise.allSettled([
      this.redis.del(`analytics:${dto.siteId}:7d`),
      this.redis.del(`analytics:${dto.siteId}:30d`),
      this.redis.del(`analytics:${dto.siteId}:90d`),
    ])
  }

  // ────────────────────────────────────────── ANALYTICS DASHBOARD ──

  /**
   * Calcula métricas de analytics para un sitio en un período dado.
   *
   * Cachea el resultado en Redis durante 5 minutos.
   * La caché se invalida cuando llega un nuevo pageview del sitio.
   */
  async getAnalytics(siteId: string, tenantId: string, period: AnalyticsPeriod = '30d') {
    // 1. Verificar que el sitio pertenece al tenant
    const site = await this.db.site.findFirst({
      where: { id: siteId, tenantId },
      select: { id: true },
    })

    if (!site) {
      throw new NotFoundException({
        code: 'SITE_NOT_FOUND',
        message: 'Sitio no encontrado',
      })
    }

    // 2. Intentar leer desde caché
    const cacheKey = `analytics:${siteId}:${period}`
    const cached = await this.redis.get(cacheKey)
    if (cached) {
      try {
        return JSON.parse(cached) as ReturnType<typeof this.buildAnalyticsResult>
      } catch {
        this.logger.warn(`Caché de analytics corrupta para ${cacheKey}`)
      }
    }

    // 3. Calcular desde DB
    const result = await this.buildAnalyticsResult(siteId, period)

    // 4. Guardar en caché
    await this.redis.set(cacheKey, JSON.stringify(result), CACHE_TTL_SECONDS)

    return result
  }

  // ────────────────────────────────────────── HELPERS ──

  private async buildAnalyticsResult(siteId: string, period: AnalyticsPeriod) {
    const days = PERIOD_DAYS[period]
    const since = new Date()
    since.setDate(since.getDate() - days)

    // Todas las vistas del período
    const pageViews = await this.pageViewModel.findMany({
      where: {
        siteId,
        createdAt: { gte: since },
      },
      select: {
        path: true,
        referrer: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    const totalViews = pageViews.length

    // Top 10 páginas por número de visitas
    const pathCounts = new Map<string, number>()
    for (const view of pageViews) {
      pathCounts.set(view.path, (pathCounts.get(view.path) ?? 0) + 1)
    }

    const uniquePaths = pathCounts.size

    const topPages = Array.from(pathCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([path, views]) => ({
        path,
        views,
        percentage: totalViews > 0 ? Math.round((views / totalViews) * 100) : 0,
      }))

    // Visitas por día
    const dayCountMap = new Map<string, number>()
    for (const view of pageViews) {
      const dateStr = view.createdAt.toISOString().slice(0, 10) // YYYY-MM-DD
      dayCountMap.set(dateStr, (dayCountMap.get(dateStr) ?? 0) + 1)
    }

    // Rellenar días sin visitas con 0
    const viewsByDay: Array<{ date: string; views: number }> = []
    for (let i = 0; i < days; i++) {
      const d = new Date(since)
      d.setDate(d.getDate() + i)
      const dateStr = d.toISOString().slice(0, 10)
      viewsByDay.push({ date: dateStr, views: dayCountMap.get(dateStr) ?? 0 })
    }

    // Referrers (null = "Directo")
    const referrerCounts = new Map<string | null, number>()
    for (const view of pageViews) {
      const ref = view.referrer ?? null
      referrerCounts.set(ref, (referrerCounts.get(ref) ?? 0) + 1)
    }

    const referrers = Array.from(referrerCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([referrer, count]) => ({ referrer, count }))

    return {
      totalViews,
      uniquePaths,
      topPages,
      viewsByDay,
      referrers,
    }
  }
}

