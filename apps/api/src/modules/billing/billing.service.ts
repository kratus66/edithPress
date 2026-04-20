import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Stripe from 'stripe'
import { DatabaseService } from '../database/database.service'
import type { CreateCheckoutDto } from './dto/create-checkout.dto'
import type { JwtPayload } from '../auth/strategies/jwt.strategy'

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name)
  private readonly stripe: Stripe

  constructor(
    private readonly db: DatabaseService,
    private readonly config: ConfigService,
  ) {
    const secretKey = this.config.getOrThrow<string>('STRIPE_SECRET_KEY')
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2024-06-20',
      typescript: true,
    })
  }

  // ────────────────────────────────────── PLANS (público) ──

  /**
   * Lista todos los planes activos ordenados por precio mensual ascendente.
   * Endpoint público — no requiere autenticación.
   */
  async getPlans() {
    return this.db.plan.findMany({
      where: { isActive: true },
      orderBy: { priceMonthly: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        priceMonthly: true,
        priceYearly: true,
        maxSites: true,
        maxPages: true,
        maxStorageGB: true,
        hasCustomDomain: true,
        hasAnalytics: true,
        hasEcommerce: true,
        hasWhiteLabel: true,
      },
    })
  }

  // ────────────────────────────────────── CHECKOUT ──

  /**
   * Crea una Stripe Checkout Session.
   *
   * Si el tenant ya tiene un stripeCustomerId (de una suscripción previa),
   * lo reutilizamos. Si no, Stripe crea uno nuevo al completar el checkout.
   *
   * El `tenantId` se pasa en metadata para que el webhook pueda
   * vincular la suscripción al tenant correcto.
   */
  async createCheckoutSession(user: JwtPayload, dto: CreateCheckoutDto) {
    const { tenantId } = user

    // 1. Verificar que el plan existe y está activo
    const plan = await this.db.plan.findFirst({
      where: { id: dto.planId, isActive: true },
    })
    if (!plan) {
      throw new NotFoundException({
        code: 'PLAN_NOT_FOUND',
        message: 'Plan no encontrado',
      })
    }

    // 2. Obtener el stripePriceId según el intervalo solicitado
    const stripePriceId =
      dto.interval === 'yearly'
        ? plan.stripePriceIdYearly
        : plan.stripePriceIdMonthly

    if (!stripePriceId) {
      throw new BadRequestException({
        code: 'PRICE_NOT_CONFIGURED',
        message: `Este plan no tiene precio configurado para facturación ${dto.interval === 'yearly' ? 'anual' : 'mensual'}`,
      })
    }

    // 3. Obtener stripeCustomerId existente si hay una suscripción previa
    const existingSubscription = await this.db.subscription.findUnique({
      where: { tenantId },
      select: { stripeCustomerId: true },
    })

    const appUrl = this.config.get<string>('APP_URL') ?? 'http://localhost:3000'

    // 4. Crear Checkout Session
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: stripePriceId, quantity: 1 }],
      // Si existe un customer previo, lo asociamos para pre-rellenar el formulario
      ...(existingSubscription?.stripeCustomerId && {
        customer: existingSubscription.stripeCustomerId,
      }),
      metadata: {
        tenantId,
        planId: dto.planId,
        interval: dto.interval,
      },
      subscription_data: {
        metadata: { tenantId, planId: dto.planId },
      },
      success_url: `${appUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/billing/cancel`,
      // Permitir promociones/cupones
      allow_promotion_codes: true,
    })

    this.logger.log(
      `Checkout session creada: tenantId=${tenantId} planId=${dto.planId} sessionId=${session.id}`,
    )

    return { url: session.url, sessionId: session.id }
  }

  // ────────────────────────────────────── PORTAL ──

  /**
   * Genera la URL del Stripe Customer Portal.
   * El tenant debe tener una suscripción activa con stripeCustomerId.
   */
  async getPortalUrl(user: JwtPayload) {
    const { tenantId } = user

    const subscription = await this.db.subscription.findUnique({
      where: { tenantId },
      select: { stripeCustomerId: true, status: true },
    })

    if (!subscription) {
      throw new NotFoundException({
        code: 'SUBSCRIPTION_NOT_FOUND',
        message: 'No tienes una suscripción activa',
      })
    }

    const appUrl = this.config.get<string>('APP_URL') ?? 'http://localhost:3000'

    const portalSession = await this.stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${appUrl}/dashboard/billing`,
    })

    this.logger.log(`Portal session creada: tenantId=${tenantId}`)

    return { url: portalSession.url }
  }

  // ────────────────────────────────────── WEBHOOK ──

  /**
   * Procesa eventos de Stripe.
   *
   * CRÍTICO: rawBody debe ser el Buffer original — NestJS body-parser
   * no debe haber transformado este payload antes de llegar aquí.
   * Ver main.ts donde se configura el rawBody middleware.
   */
  async handleWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = this.config.getOrThrow<string>('STRIPE_WEBHOOK_SECRET')

    let event: Stripe.Event
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signature verification failed'
      this.logger.warn(`Webhook signature inválida: ${message}`)
      throw new BadRequestException({
        code: 'INVALID_WEBHOOK_SIGNATURE',
        message: 'Firma del webhook inválida',
      })
    }

    this.logger.log(`Webhook recibido: type=${event.type} id=${event.id}`)

    try {
      switch (event.type) {
        case 'customer.subscription.created':
          await this.onSubscriptionCreated(event.data.object as Stripe.Subscription)
          break

        case 'customer.subscription.updated':
          await this.onSubscriptionUpdated(event.data.object as Stripe.Subscription)
          break

        case 'customer.subscription.deleted':
          await this.onSubscriptionDeleted(event.data.object as Stripe.Subscription)
          break

        case 'invoice.payment_succeeded':
          await this.onInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
          break

        case 'invoice.payment_failed':
          await this.onInvoicePaymentFailed(event.data.object as Stripe.Invoice)
          break

        default:
          // Eventos no manejados — logueamos y respondemos 200 para evitar retries
          this.logger.debug(`Evento no manejado: ${event.type}`)
      }
    } catch (err) {
      // Si falla el procesamiento, Stripe reintentará el webhook
      this.logger.error(`Error procesando webhook ${event.type}:`, err)
      throw new InternalServerErrorException({
        code: 'WEBHOOK_PROCESSING_FAILED',
        message: 'Error procesando el evento',
      })
    }

    return { received: true }
  }

  // ────────────────────────────────────── HANDLERS PRIVADOS ──

  /**
   * customer.subscription.created
   * Crea o actualiza el registro Subscription en nuestra DB.
   * Los metadata del subscription contienen tenantId y planId
   * (los pusimos al crear el Checkout Session).
   */
  private async onSubscriptionCreated(subscription: Stripe.Subscription) {
    const { tenantId, planId } = subscription.metadata

    if (!tenantId || !planId) {
      this.logger.warn(
        `Subscription ${subscription.id} sin metadata tenantId/planId — ignorado`,
      )
      return
    }

    await this.db.subscription.upsert({
      where: { tenantId },
      create: {
        tenantId,
        planId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        status: mapStripeStatus(subscription.status),
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
      update: {
        planId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        status: mapStripeStatus(subscription.status),
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    })

    // Actualizar el plan del tenant en la tabla Tenant
    await this.db.tenant.update({
      where: { id: tenantId },
      data: { planId },
    })

    this.logger.log(
      `Suscripción creada: tenantId=${tenantId} subId=${subscription.id}`,
    )
  }

  /**
   * customer.subscription.updated
   * Se dispara en cambios de plan (upgrade/downgrade), estado (past_due),
   * o cuando se activa cancel_at_period_end.
   */
  private async onSubscriptionUpdated(subscription: Stripe.Subscription) {
    const existing = await this.db.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
      select: { tenantId: true },
    })

    if (!existing) {
      this.logger.warn(`Subscription no encontrada en DB: ${subscription.id}`)
      return
    }

    // Si hay un nuevo planId en metadata, también actualizamos el tenant
    const planId = subscription.metadata?.planId

    await this.db.$transaction(async (tx) => {
      await tx.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          status: mapStripeStatus(subscription.status),
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          ...(planId && { planId }),
        },
      })

      if (planId) {
        await tx.tenant.update({
          where: { id: existing.tenantId },
          data: { planId },
        })
      }
    })

    this.logger.log(`Suscripción actualizada: subId=${subscription.id}`)
  }

  /**
   * customer.subscription.deleted
   * La suscripción fue cancelada efectivamente (no solo marcada para cancelar).
   * Marcamos el status CANCELED en nuestra DB.
   */
  private async onSubscriptionDeleted(subscription: Stripe.Subscription) {
    const existing = await this.db.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
      select: { tenantId: true },
    })

    if (!existing) return

    // Downgrade al plan starter cuando se cancela la suscripción
    const starterPlan = await this.db.plan.findUnique({
      where: { slug: 'starter' },
      select: { id: true },
    })

    await this.db.$transaction(async (tx) => {
      await tx.subscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: { status: 'CANCELED', cancelAtPeriodEnd: false },
      })

      if (starterPlan) {
        await tx.tenant.update({
          where: { id: existing.tenantId },
          data: { planId: starterPlan.id },
        })
      }
    })

    this.logger.log(
      `Suscripción cancelada: tenantId=${existing.tenantId} subId=${subscription.id}`,
    )
  }

  /**
   * invoice.payment_succeeded
   * Registra la factura en nuestra DB.
   * También nos aseguramos de que el status de la suscripción sea ACTIVE.
   */
  private async onInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    if (!invoice.subscription || invoice.status !== 'paid') return

    const sub = await this.db.subscription.findUnique({
      where: { stripeSubscriptionId: invoice.subscription as string },
      select: { id: true },
    })

    if (!sub) {
      this.logger.warn(`Subscription no encontrada para invoice ${invoice.id}`)
      return
    }

    await this.db.$transaction([
      this.db.invoice.create({
        data: {
          subscriptionId: sub.id,
          stripeInvoiceId: invoice.id,
          amount: (invoice.amount_paid / 100).toFixed(2) as unknown as number,
          currency: invoice.currency,
          status: 'PAID',
          pdfUrl: invoice.invoice_pdf,
        },
      }),
      this.db.subscription.update({
        where: { id: sub.id },
        data: { status: 'ACTIVE' },
      }),
    ])

    this.logger.log(`Factura pagada: invoiceId=${invoice.id}`)
  }

  /**
   * invoice.payment_failed
   * Marca la suscripción como PAST_DUE y registra la factura fallida.
   * El tenant debería recibir un email de alerta (lógica futura).
   */
  private async onInvoicePaymentFailed(invoice: Stripe.Invoice) {
    if (!invoice.subscription) return

    const sub = await this.db.subscription.findUnique({
      where: { stripeSubscriptionId: invoice.subscription as string },
      select: { id: true, tenantId: true },
    })

    if (!sub) return

    await this.db.$transaction([
      this.db.invoice.create({
        data: {
          subscriptionId: sub.id,
          stripeInvoiceId: invoice.id,
          amount: (invoice.amount_due / 100).toFixed(2) as unknown as number,
          currency: invoice.currency,
          status: 'OPEN',
        },
      }),
      this.db.subscription.update({
        where: { id: sub.id },
        data: { status: 'PAST_DUE' },
      }),
    ])

    this.logger.warn(
      `Pago fallido: tenantId=${sub.tenantId} invoiceId=${invoice.id}`,
    )
    // TODO: enviar email de alerta al OWNER del tenant via Resend
  }
}

// ────────────────────────────────────── HELPERS ──

/**
 * Mapea el status de Stripe al enum SubscriptionStatus de nuestro schema.
 * Stripe puede devolver: active, past_due, canceled, trialing, incomplete, etc.
 */
function mapStripeStatus(
  stripeStatus: Stripe.Subscription.Status,
): 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING' | 'INCOMPLETE' {
  const map: Record<string, 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING' | 'INCOMPLETE'> = {
    active: 'ACTIVE',
    past_due: 'PAST_DUE',
    canceled: 'CANCELED',
    trialing: 'TRIALING',
    incomplete: 'INCOMPLETE',
    incomplete_expired: 'CANCELED',
    unpaid: 'PAST_DUE',
    paused: 'PAST_DUE',
  }
  return map[stripeStatus] ?? 'INCOMPLETE'
}
