import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import type { CreateTenantDto } from './dto/create-tenant.dto'
import type { UpdateTenantDto } from './dto/update-tenant.dto'

const TENANT_SELECT = {
  id: true,
  name: true,
  slug: true,
  logoUrl: true,
  planId: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name)

  constructor(private readonly db: DatabaseService) {}

  /**
   * Crea un nuevo tenant y asigna al userId como OWNER.
   * El plan por defecto es "starter" (debe existir en DB via seed).
   */
  async create(userId: string, dto: CreateTenantDto) {
    const existing = await this.db.tenant.findUnique({ where: { slug: dto.slug } })
    if (existing) {
      throw new ConflictException({
        code: 'SLUG_ALREADY_EXISTS',
        message: 'Ya existe un workspace con ese slug',
      })
    }

    const starterPlan = await this.db.plan.findUniqueOrThrow({
      where: { slug: 'starter' },
    })

    return this.db.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          logoUrl: dto.logoUrl,
          planId: starterPlan.id,
        },
        select: TENANT_SELECT,
      })

      await tx.tenantUser.create({
        data: { userId, tenantId: tenant.id, role: 'OWNER' },
      })

      this.logger.log(`Tenant creado: tenantId=${tenant.id} userId=${userId}`)
      return tenant
    })
  }

  /** Stats del dashboard para el tenant autenticado. */
  async getStats(tenantId: string) {
    const [sitesCount, pagesCount, subscription] = await Promise.all([
      this.db.site.count({ where: { tenantId } }),
      this.db.page.count({ where: { site: { tenantId } } }),
      this.db.subscription.findFirst({
        where: { tenantId, status: 'ACTIVE' },
        include: { plan: { select: { name: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    const visits30d = await this.db.pageView.count({
      where: {
        site: { tenantId },
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    })

    return {
      sitesCount,
      pagesCount,
      visits30d,
      planName: subscription?.plan?.name ?? 'Free',
      planSlug: subscription?.plan?.slug ?? 'free',
    }
  }

  /** Retorna el tenant por ID. El TenantGuard ya verificó que el caller tiene acceso. */
  async findById(tenantId: string) {
    const tenant = await this.db.tenant.findUnique({
      where: { id: tenantId },
      select: TENANT_SELECT,
    })

    if (!tenant) throw new NotFoundException('Tenant no encontrado')
    return tenant
  }

  /**
   * Actualiza datos del tenant.
   * Solo el OWNER puede hacerlo (verificado por RolesGuard en el controller).
   * Si cambia el slug, verifica que no esté en uso por otro tenant.
   */
  async update(tenantId: string, dto: UpdateTenantDto) {
    if (dto.slug) {
      const conflict = await this.db.tenant.findFirst({
        where: { slug: dto.slug, id: { not: tenantId } },
      })
      if (conflict) {
        throw new ConflictException({
          code: 'SLUG_ALREADY_EXISTS',
          message: 'Ya existe un workspace con ese slug',
        })
      }
    }

    return this.db.tenant.update({
      where: { id: tenantId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
      },
      select: TENANT_SELECT,
    })
  }
}
