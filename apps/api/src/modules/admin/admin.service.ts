import { Injectable, Logger } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'

export interface AdminStats {
  totalTenants: number
  newThisWeek: number
  activeSites: number
  mrr: number
}

export interface TenantListItem {
  id: string
  name: string
  slug: string
  plan: { name: string; slug: string }
  isActive: boolean
  siteCount: number
  createdAt: Date
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name)

  constructor(private readonly db: DatabaseService) {}

  // ─────────────────────────────────────────────── STATS ──

  async getStats(): Promise<AdminStats> {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const [totalTenants, newThisWeek, activeSites, activeSubscriptions] = await Promise.all([
      this.db.tenant.count(),
      this.db.tenant.count({ where: { createdAt: { gte: weekAgo } } }),
      this.db.site.count({ where: { isPublished: true } }),
      this.db.subscription.findMany({
        where: { status: 'ACTIVE' },
        include: { plan: { select: { priceMonthly: true } } },
      }),
    ])

    const mrr = activeSubscriptions.reduce(
      (sum, sub) => sum + Number(sub.plan.priceMonthly ?? 0),
      0,
    )

    return { totalTenants, newThisWeek, activeSites, mrr }
  }

  // ─────────────────────────────────────────────── TENANTS ──

  async getTenants(opts: { page: number; limit: number; search?: string; status?: string }) {
    const { page, limit, search, status } = opts
    const skip = (page - 1) * limit

    const where = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { slug: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(status === 'active' ? { isActive: true } : status === 'suspended' ? { isActive: false } : {}),
    }

    const [tenants, total] = await Promise.all([
      this.db.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          plan: { select: { name: true, slug: true } },
          _count: { select: { sites: true } },
        },
      }),
      this.db.tenant.count({ where }),
    ])

    const data: TenantListItem[] = tenants.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      plan: t.plan,
      isActive: t.isActive,
      siteCount: t._count.sites,
      createdAt: t.createdAt,
    }))

    return { data, total, page, limit }
  }

  async getTenantById(id: string) {
    return this.db.tenant.findUniqueOrThrow({
      where: { id },
      include: {
        plan: true,
        tenantUsers: {
          include: { user: { select: { id: true, email: true, firstName: true, lastName: true, createdAt: true } } },
        },
        sites: {
          select: { id: true, name: true, isPublished: true, createdAt: true },
        },
        subscription: {
          include: { plan: { select: { name: true, priceMonthly: true } } },
        },
        _count: { select: { sites: true, mediaFiles: true } },
      },
    })
  }

  async updateTenantStatus(id: string, isActive: boolean) {
    const tenant = await this.db.tenant.update({
      where: { id },
      data: { isActive },
      select: { id: true, name: true, isActive: true },
    })

    this.logger.log(`Tenant ${id} ${isActive ? 'activado' : 'suspendido'} por super-admin`)
    return tenant
  }

  // ─────────────────────────────────────────────── PLANS ──

  async getPlans() {
    const plans = await this.db.plan.findMany({
      orderBy: { priceMonthly: 'asc' },
      include: {
        _count: {
          select: {
            subscriptions: { where: { status: 'ACTIVE' } },
            tenants: true,
          },
        },
      },
    })

    return plans.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      priceMonthly: p.priceMonthly,
      priceYearly: p.priceYearly,
      maxSites: p.maxSites,
      maxPages: p.maxPages,
      isActive: p.isActive,
      activeTenants: p._count.subscriptions,
      totalTenants: p._count.tenants,
    }))
  }
}
