import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BillingService } from './billing.service'
import { DatabaseService } from '../database/database.service'
import type { JwtPayload } from '../auth/strategies/jwt.strategy'

// ─── Stripe mock ──────────────────────────────────────────────────────────────
//
// Las variables que empiezan con 'mock' son accesibles dentro del factory de
// jest.mock() porque Babel/ts-jest las hoistea junto con la llamada a jest.mock.
//
const mockCheckoutSessionsCreate = jest.fn()
const mockWebhooksConstructEvent = jest.fn()
const mockBillingPortalSessionsCreate = jest.fn()

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: { sessions: { create: mockCheckoutSessionsCreate } },
    webhooks: { constructEvent: mockWebhooksConstructEvent },
    billingPortal: { sessions: { create: mockBillingPortalSessionsCreate } },
  }))
})

// ─────────────────────────────────────────────────────────────────────────────

describe('BillingService', () => {
  let service: BillingService

  // ─── Mock DatabaseService ─────────────────────────────────────────────────
  const mockDb = {
    plan: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    subscription: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    tenant: {
      update: jest.fn(),
    },
    invoice: {
      create: jest.fn(),
    },
    $transaction: jest.fn((arg: unknown) => {
      if (typeof arg === 'function') {
        return (arg as (tx: typeof mockDb) => Promise<unknown>)(mockDb)
      }
      if (Array.isArray(arg)) {
        return Promise.all(arg as Promise<unknown>[])
      }
      return Promise.resolve()
    }),
  }

  // ─── Mock ConfigService ───────────────────────────────────────────────────
  //
  // BillingService llama getOrThrow('STRIPE_SECRET_KEY') en el constructor,
  // por lo que el mock debe estar listo antes de module.compile().
  //
  const mockConfig = {
    getOrThrow: jest.fn().mockImplementation((key: string): string => {
      const values: Record<string, string> = {
        STRIPE_SECRET_KEY: 'sk_test_mock_key_xxxxxxxxxxxxxxxxxxx',
        STRIPE_WEBHOOK_SECRET: 'whsec_mock_secret_xxxxxxxxxxxxxxxx',
      }
      if (!(key in values)) throw new Error(`ConfigService: key no encontrada: ${key}`)
      return values[key]
    }),
    get: jest.fn().mockReturnValue('http://localhost:3000'),
  }

  // ─── Setup ────────────────────────────────────────────────────────────────

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        { provide: DatabaseService, useValue: mockDb },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile()

    service = module.get<BillingService>(BillingService)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    // Restaurar implementaciones de config tras clearAllMocks
    mockConfig.getOrThrow.mockImplementation((key: string): string => {
      const values: Record<string, string> = {
        STRIPE_SECRET_KEY: 'sk_test_mock_key_xxxxxxxxxxxxxxxxxxx',
        STRIPE_WEBHOOK_SECRET: 'whsec_mock_secret_xxxxxxxxxxxxxxxx',
      }
      if (!(key in values)) throw new Error(`ConfigService: key no encontrada: ${key}`)
      return values[key]
    })
    mockConfig.get.mockReturnValue('http://localhost:3000')
  })

  // ─────────────────────────────────────── handleWebhook() ──

  describe('handleWebhook()', () => {
    const rawBody = Buffer.from(JSON.stringify({ type: 'test.event' }))
    const signature = 'test-stripe-signature'

    it('should throw BadRequestException when Stripe signature is invalid', async () => {
      // Arrange — Stripe rechaza la firma
      mockWebhooksConstructEvent.mockImplementationOnce(() => {
        throw new Error('No signatures found matching the expected signature for payload')
      })

      // Act & Assert
      await expect(service.handleWebhook(rawBody, signature))
        .rejects.toThrow(BadRequestException)
    })

    it('should throw BadRequestException with INVALID_WEBHOOK_SIGNATURE code on bad sig', async () => {
      // Arrange
      mockWebhooksConstructEvent.mockImplementationOnce(() => {
        throw new Error('Webhook signature verification failed')
      })

      // Act
      let caughtError: BadRequestException | undefined
      try {
        await service.handleWebhook(rawBody, signature)
      } catch (err) {
        caughtError = err as BadRequestException
      }

      // Assert
      expect(caughtError).toBeInstanceOf(BadRequestException)
      const response = caughtError?.getResponse() as Record<string, string>
      expect(response.code).toBe('INVALID_WEBHOOK_SIGNATURE')
    })

    it('should process customer.subscription.updated and update DB', async () => {
      // Arrange
      const stripeSubscription = buildStripeSubscription('sub_updated_1', 'active', 'tenant-1', 'plan-1')
      mockWebhooksConstructEvent.mockReturnValueOnce({
        type: 'customer.subscription.updated',
        id: 'evt_updated_1',
        data: { object: stripeSubscription },
      })
      mockDb.subscription.findUnique.mockResolvedValueOnce({ tenantId: 'tenant-1' })
      mockDb.subscription.update.mockResolvedValueOnce({})
      mockDb.tenant.update.mockResolvedValueOnce({})

      // Act
      const result = await service.handleWebhook(rawBody, signature)

      // Assert
      expect(result).toEqual({ received: true })
      expect(mockDb.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { stripeSubscriptionId: 'sub_updated_1' },
          data: expect.objectContaining({ status: 'ACTIVE' }),
        }),
      )
      // planId en metadata → también actualiza el tenant
      expect(mockDb.tenant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'tenant-1' },
          data: { planId: 'plan-1' },
        }),
      )
    })

    it('should process customer.subscription.updated gracefully when subscription not found in DB', async () => {
      // Arrange — suscripción no existe en nuestra DB (edge case)
      const stripeSubscription = buildStripeSubscription('sub_unknown', 'active', 'tenant-x', 'plan-x')
      mockWebhooksConstructEvent.mockReturnValueOnce({
        type: 'customer.subscription.updated',
        id: 'evt_unknown_sub',
        data: { object: stripeSubscription },
      })
      mockDb.subscription.findUnique.mockResolvedValueOnce(null) // no encontrada

      // Act — no debe lanzar excepción
      const result = await service.handleWebhook(rawBody, signature)

      // Assert — retorno normal, no se ejecutó el update
      expect(result).toEqual({ received: true })
      expect(mockDb.subscription.update).not.toHaveBeenCalled()
    })

    it('should process invoice.payment_succeeded and create Invoice record in DB', async () => {
      // Arrange
      const invoice = buildStripeInvoice('inv_paid_1', 'sub_stripe_1', 'paid', 2900)
      mockWebhooksConstructEvent.mockReturnValueOnce({
        type: 'invoice.payment_succeeded',
        id: 'evt_invoice_paid',
        data: { object: invoice },
      })
      mockDb.subscription.findUnique.mockResolvedValueOnce({ id: 'sub-record-uuid' })
      mockDb.invoice.create.mockResolvedValueOnce({ id: 'invoice-record-1' })
      mockDb.subscription.update.mockResolvedValueOnce({})

      // Act
      const result = await service.handleWebhook(rawBody, signature)

      // Assert
      expect(result).toEqual({ received: true })
      expect(mockDb.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            stripeInvoiceId: 'inv_paid_1',
            status: 'PAID',
            currency: 'usd',
          }),
        }),
      )
      // La suscripción pasa a ACTIVE tras el pago exitoso
      expect(mockDb.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sub-record-uuid' },
          data: { status: 'ACTIVE' },
        }),
      )
    })

    it('should skip invoice.payment_succeeded when invoice status is not "paid"', async () => {
      // Arrange — invoice con status diferente de "paid"
      const invoice = buildStripeInvoice('inv_open_1', 'sub_stripe_1', 'open', 2900)
      mockWebhooksConstructEvent.mockReturnValueOnce({
        type: 'invoice.payment_succeeded',
        id: 'evt_invoice_open',
        data: { object: invoice },
      })

      // Act
      await service.handleWebhook(rawBody, signature)

      // Assert — no se procesó (la condición invoice.status !== 'paid' lo descarta)
      expect(mockDb.invoice.create).not.toHaveBeenCalled()
    })

    it('should return { received: true } gracefully for unknown event types', async () => {
      // Arrange — evento que no manejamos
      mockWebhooksConstructEvent.mockReturnValueOnce({
        type: 'payment_method.attached',
        id: 'evt_unhandled',
        data: { object: {} },
      })

      // Act — no debe lanzar ni procesar nada
      const result = await service.handleWebhook(rawBody, signature)

      // Assert
      expect(result).toEqual({ received: true })
      expect(mockDb.subscription.update).not.toHaveBeenCalled()
      expect(mockDb.invoice.create).not.toHaveBeenCalled()
    })
  })

  // ─────────────────────────────────────── createCheckoutSession() ──

  describe('createCheckoutSession()', () => {
    const user: JwtPayload = {
      sub: 'user-1',
      email: 'owner@test.com',
      tenantId: 'tenant-1',
      role: 'OWNER',
    }

    it('should return checkout URL and sessionId from Stripe', async () => {
      // Arrange
      mockDb.plan.findFirst.mockResolvedValueOnce({
        id: 'plan-business',
        stripePriceIdMonthly: 'price_monthly_abc',
        stripePriceIdYearly: 'price_yearly_abc',
      })
      mockDb.subscription.findUnique.mockResolvedValueOnce(null) // sin customer previo
      mockCheckoutSessionsCreate.mockResolvedValueOnce({
        id: 'cs_test_abc123',
        url: 'https://checkout.stripe.com/pay/cs_test_abc123',
      })

      // Act
      const result = await service.createCheckoutSession(user, {
        planId: 'plan-business',
        interval: 'monthly',
      })

      // Assert
      expect(result.url).toBe('https://checkout.stripe.com/pay/cs_test_abc123')
      expect(result.sessionId).toBe('cs_test_abc123')
    })

    it('should call Stripe with mode: subscription and correct price', async () => {
      // Arrange
      mockDb.plan.findFirst.mockResolvedValueOnce({
        id: 'plan-business',
        stripePriceIdMonthly: 'price_monthly_abc',
        stripePriceIdYearly: 'price_yearly_abc',
      })
      mockDb.subscription.findUnique.mockResolvedValueOnce(null)
      mockCheckoutSessionsCreate.mockResolvedValueOnce({
        id: 'cs_test_xyz',
        url: 'https://checkout.stripe.com/pay/cs_test_xyz',
      })

      // Act
      await service.createCheckoutSession(user, { planId: 'plan-business', interval: 'monthly' })

      // Assert — Stripe recibió los parámetros correctos
      expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'subscription',
          payment_method_types: ['card'],
          line_items: [{ price: 'price_monthly_abc', quantity: 1 }],
          metadata: expect.objectContaining({
            tenantId: 'tenant-1',
            planId: 'plan-business',
            interval: 'monthly',
          }),
        }),
      )
    })

    it('should use yearly price when interval is "yearly"', async () => {
      // Arrange
      mockDb.plan.findFirst.mockResolvedValueOnce({
        id: 'plan-pro',
        stripePriceIdMonthly: 'price_monthly_pro',
        stripePriceIdYearly: 'price_yearly_pro',
      })
      mockDb.subscription.findUnique.mockResolvedValueOnce(null)
      mockCheckoutSessionsCreate.mockResolvedValueOnce({
        id: 'cs_yearly',
        url: 'https://checkout.stripe.com/pay/cs_yearly',
      })

      // Act
      await service.createCheckoutSession(user, { planId: 'plan-pro', interval: 'yearly' })

      // Assert — se usó el precio anual
      expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: [{ price: 'price_yearly_pro', quantity: 1 }],
        }),
      )
    })

    it('should include existing stripeCustomerId when tenant has prior subscription', async () => {
      // Arrange — tenant ya tiene un stripeCustomerId
      mockDb.plan.findFirst.mockResolvedValueOnce({
        id: 'plan-business',
        stripePriceIdMonthly: 'price_monthly_abc',
        stripePriceIdYearly: 'price_yearly_abc',
      })
      mockDb.subscription.findUnique.mockResolvedValueOnce({
        stripeCustomerId: 'cus_existing_123',
      })
      mockCheckoutSessionsCreate.mockResolvedValueOnce({
        id: 'cs_existing_cust',
        url: 'https://checkout.stripe.com/pay/cs_existing_cust',
      })

      // Act
      await service.createCheckoutSession(user, { planId: 'plan-business', interval: 'monthly' })

      // Assert — Stripe recibió el customer ID para pre-rellenar el formulario
      expect(mockCheckoutSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_existing_123',
        }),
      )
    })

    it('should throw NotFoundException when plan does not exist or is inactive', async () => {
      // Arrange
      mockDb.plan.findFirst.mockResolvedValueOnce(null) // plan no encontrado

      // Act & Assert
      await expect(
        service.createCheckoutSession(user, {
          planId: 'nonexistent-plan-id',
          interval: 'monthly',
        }),
      ).rejects.toThrow(NotFoundException)
    })

    it('should throw BadRequestException when plan has no monthly price configured', async () => {
      // Arrange — plan sin precio mensual
      mockDb.plan.findFirst.mockResolvedValueOnce({
        id: 'plan-incomplete',
        stripePriceIdMonthly: null,
        stripePriceIdYearly: 'price_yearly_ok',
      })

      // Act & Assert
      await expect(
        service.createCheckoutSession(user, {
          planId: 'plan-incomplete',
          interval: 'monthly',
        }),
      ).rejects.toThrow(BadRequestException)
    })

    it('should throw BadRequestException when plan has no yearly price configured', async () => {
      // Arrange — plan sin precio anual
      mockDb.plan.findFirst.mockResolvedValueOnce({
        id: 'plan-incomplete-yearly',
        stripePriceIdMonthly: 'price_monthly_ok',
        stripePriceIdYearly: null,
      })

      // Act & Assert
      await expect(
        service.createCheckoutSession(user, {
          planId: 'plan-incomplete-yearly',
          interval: 'yearly',
        }),
      ).rejects.toThrow(BadRequestException)
    })
  })

  // ─────────────────────────────────────── mapStripeStatus (via webhook) ──
  //
  // La función mapStripeStatus() es privada pero se ejercita indirectamente
  // a través de handleWebhook() → onSubscriptionCreated/Updated.
  // Cubrimos los status de Stripe menos comunes para aumentar branch coverage.
  //

  describe('handleWebhook() — mapStripeStatus coverage', () => {
    const rawBody = Buffer.from(JSON.stringify({ type: 'test.event' }))
    const signature = 'test-stripe-signature'

    const stripeStatuses: Array<{ stripe: string; expected: string }> = [
      { stripe: 'trialing', expected: 'TRIALING' },
      { stripe: 'incomplete', expected: 'INCOMPLETE' },
      { stripe: 'incomplete_expired', expected: 'CANCELED' },
      { stripe: 'unpaid', expected: 'PAST_DUE' },
      { stripe: 'paused', expected: 'PAST_DUE' },
    ]

    for (const { stripe, expected } of stripeStatuses) {
      it(`should map Stripe status "${stripe}" to DB status "${expected}"`, async () => {
        // Arrange
        const subscription = buildStripeSubscription('sub_status_test', stripe, 'tenant-status', 'plan-x')
        mockWebhooksConstructEvent.mockReturnValueOnce({
          type: 'customer.subscription.created',
          id: `evt_status_${stripe}`,
          data: { object: subscription },
        })
        mockDb.subscription.upsert.mockResolvedValueOnce({})
        mockDb.tenant.update.mockResolvedValueOnce({})

        // Act
        const result = await service.handleWebhook(rawBody, signature)

        // Assert
        expect(result).toEqual({ received: true })
        expect(mockDb.subscription.upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            create: expect.objectContaining({ status: expected }),
            update: expect.objectContaining({ status: expected }),
          }),
        )
      })
    }

    it('should map unknown Stripe status to INCOMPLETE (default fallback)', async () => {
      // Arrange
      const subscription = buildStripeSubscription('sub_unknown_status', 'some_future_status', 'tenant-unk', 'plan-x')
      mockWebhooksConstructEvent.mockReturnValueOnce({
        type: 'customer.subscription.created',
        id: 'evt_unknown_status',
        data: { object: subscription },
      })
      mockDb.subscription.upsert.mockResolvedValueOnce({})
      mockDb.tenant.update.mockResolvedValueOnce({})

      // Act
      const result = await service.handleWebhook(rawBody, signature)

      // Assert — el default ?? 'INCOMPLETE' debe aplicarse
      expect(result).toEqual({ received: true })
      expect(mockDb.subscription.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({ status: 'INCOMPLETE' }),
        }),
      )
    })

    it('should process customer.subscription.deleted and skip tenant downgrade when starter plan not found', async () => {
      // Arrange — plan starter no existe en la DB
      const subscription = buildStripeSubscription('sub_del_no_starter', 'canceled', 'tenant-no-starter', 'plan-old')
      mockWebhooksConstructEvent.mockReturnValueOnce({
        type: 'customer.subscription.deleted',
        id: 'evt_del_no_starter',
        data: { object: subscription },
      })
      mockDb.subscription.findUnique.mockResolvedValueOnce({ tenantId: 'tenant-no-starter' })
      mockDb.plan.findUnique.mockResolvedValueOnce(null) // plan starter no encontrado
      mockDb.subscription.update.mockResolvedValueOnce({})

      // Act
      const result = await service.handleWebhook(rawBody, signature)

      // Assert — procesó sin error, actualizó suscripción pero NO el tenant (sin plan starter)
      expect(result).toEqual({ received: true })
      expect(mockDb.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'CANCELED' }),
        }),
      )
      expect(mockDb.tenant.update).not.toHaveBeenCalled()
    })

    it('should skip customer.subscription.deleted when subscription not found in DB', async () => {
      // Arrange
      const subscription = buildStripeSubscription('sub_del_notfound', 'canceled', 'tenant-x', 'plan-x')
      mockWebhooksConstructEvent.mockReturnValueOnce({
        type: 'customer.subscription.deleted',
        id: 'evt_del_notfound',
        data: { object: subscription },
      })
      mockDb.subscription.findUnique.mockResolvedValueOnce(null)

      // Act
      const result = await service.handleWebhook(rawBody, signature)

      // Assert — retorna 200 sin procesar
      expect(result).toEqual({ received: true })
      expect(mockDb.subscription.update).not.toHaveBeenCalled()
    })

    it('should skip invoice.payment_succeeded when subscription not found in DB', async () => {
      // Arrange
      const invoice = buildStripeInvoice('inv_no_sub_record', 'sub_missing', 'paid', 1000)
      mockWebhooksConstructEvent.mockReturnValueOnce({
        type: 'invoice.payment_succeeded',
        id: 'evt_no_sub_record',
        data: { object: invoice },
      })
      mockDb.subscription.findUnique.mockResolvedValueOnce(null)

      // Act
      const result = await service.handleWebhook(rawBody, signature)

      // Assert
      expect(result).toEqual({ received: true })
      expect(mockDb.invoice.create).not.toHaveBeenCalled()
    })

    it('should update subscription status only (no tenant update) when subscription.updated has no planId in metadata', async () => {
      // Arrange — metadata sin planId → la rama `if (planId)` no se ejecuta
      const subscription = {
        ...buildStripeSubscription('sub_no_plan', 'past_due', 'tenant-2', ''),
        metadata: { tenantId: 'tenant-2' }, // planId ausente
      }
      mockWebhooksConstructEvent.mockReturnValueOnce({
        type: 'customer.subscription.updated',
        id: 'evt_no_plan_meta',
        data: { object: subscription },
      })
      mockDb.subscription.findUnique.mockResolvedValueOnce({ tenantId: 'tenant-2' })
      mockDb.subscription.update.mockResolvedValueOnce({})

      // Act
      const result = await service.handleWebhook(rawBody, signature)

      // Assert — actualizó la suscripción pero NO el tenant
      expect(result).toEqual({ received: true })
      expect(mockDb.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PAST_DUE' }),
        }),
      )
      expect(mockDb.tenant.update).not.toHaveBeenCalled()
    })

    it('should skip invoice.payment_failed subscription lookup when sub not found in DB', async () => {
      // Arrange — la factura tiene subscription pero ésta no está en nuestra DB
      const invoice = buildStripeInvoice('inv_fail_no_sub', 'sub_not_in_db', 'open', 500)
      mockWebhooksConstructEvent.mockReturnValueOnce({
        type: 'invoice.payment_failed',
        id: 'evt_fail_no_sub',
        data: { object: invoice },
      })
      mockDb.subscription.findUnique.mockResolvedValueOnce(null)

      // Act
      const result = await service.handleWebhook(rawBody, signature)

      // Assert
      expect(result).toEqual({ received: true })
      expect(mockDb.invoice.create).not.toHaveBeenCalled()
    })
  })

  // ─────────────────────────────────────── getPlans() ──

  describe('getPlans()', () => {
    it('should return list of active plans ordered by monthly price', async () => {
      // Arrange
      const plans = [
        { id: 'plan-starter', name: 'Starter', slug: 'starter', priceMonthly: 0 },
        { id: 'plan-pro', name: 'Pro', slug: 'pro', priceMonthly: 19 },
        { id: 'plan-business', name: 'Business', slug: 'business', priceMonthly: 49 },
      ]
      mockDb.plan.findMany.mockResolvedValueOnce(plans)

      // Act
      const result = await service.getPlans()

      // Assert
      expect(result).toEqual(plans)
      expect(mockDb.plan.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
          orderBy: { priceMonthly: 'asc' },
        }),
      )
    })

    it('should return empty array when no active plans exist', async () => {
      // Arrange
      mockDb.plan.findMany.mockResolvedValueOnce([])

      // Act
      const result = await service.getPlans()

      // Assert
      expect(result).toEqual([])
    })
  })

  // ─────────────────────────────────────── getPortalUrl() ──

  describe('getPortalUrl()', () => {
    const user: JwtPayload = {
      sub: 'user-1',
      email: 'owner@test.com',
      tenantId: 'tenant-portal-1',
      role: 'OWNER',
    }

    it('should return portal URL when tenant has active subscription', async () => {
      // Arrange
      mockDb.subscription.findUnique.mockResolvedValueOnce({
        stripeCustomerId: 'cus_portal_abc',
        status: 'ACTIVE',
      })
      mockBillingPortalSessionsCreate.mockResolvedValueOnce({
        url: 'https://billing.stripe.com/portal/session_123',
      })

      // Act
      const result = await service.getPortalUrl(user)

      // Assert
      expect(result.url).toBe('https://billing.stripe.com/portal/session_123')
      expect(mockBillingPortalSessionsCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_portal_abc',
        }),
      )
    })

    it('should throw NotFoundException when tenant has no subscription', async () => {
      // Arrange
      mockDb.subscription.findUnique.mockResolvedValueOnce(null)

      // Act & Assert
      await expect(service.getPortalUrl(user)).rejects.toThrow(NotFoundException)
    })
  })

  // ─────────────────────────────────────── handleWebhook — eventos adicionales ──

  describe('handleWebhook() — additional event handlers', () => {
    const rawBody = Buffer.from(JSON.stringify({ type: 'test.event' }))
    const signature = 'test-stripe-signature'

    it('should process customer.subscription.created and upsert Subscription in DB', async () => {
      // Arrange
      const subscription = buildStripeSubscription('sub_created_1', 'active', 'tenant-new', 'plan-pro')
      mockWebhooksConstructEvent.mockReturnValueOnce({
        type: 'customer.subscription.created',
        id: 'evt_created_1',
        data: { object: subscription },
      })
      mockDb.subscription.upsert.mockResolvedValueOnce({})
      mockDb.tenant.update.mockResolvedValueOnce({})

      // Act
      const result = await service.handleWebhook(rawBody, signature)

      // Assert
      expect(result).toEqual({ received: true })
      expect(mockDb.subscription.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-new' },
          create: expect.objectContaining({
            tenantId: 'tenant-new',
            planId: 'plan-pro',
            stripeSubscriptionId: 'sub_created_1',
            status: 'ACTIVE',
          }),
        }),
      )
      expect(mockDb.tenant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'tenant-new' },
          data: { planId: 'plan-pro' },
        }),
      )
    })

    it('should skip customer.subscription.created when metadata is missing tenantId', async () => {
      // Arrange — subscription sin metadata
      const subscription = {
        ...buildStripeSubscription('sub_no_meta', 'active', '', ''),
        metadata: {}, // sin tenantId ni planId
      }
      mockWebhooksConstructEvent.mockReturnValueOnce({
        type: 'customer.subscription.created',
        id: 'evt_no_meta',
        data: { object: subscription },
      })

      // Act
      const result = await service.handleWebhook(rawBody, signature)

      // Assert — no lanza excepción, solo loguea y retorna
      expect(result).toEqual({ received: true })
      expect(mockDb.subscription.upsert).not.toHaveBeenCalled()
    })

    it('should process customer.subscription.deleted and set status to CANCELED', async () => {
      // Arrange
      const subscription = buildStripeSubscription('sub_deleted_1', 'canceled', 'tenant-del', 'plan-old')
      mockWebhooksConstructEvent.mockReturnValueOnce({
        type: 'customer.subscription.deleted',
        id: 'evt_deleted_1',
        data: { object: subscription },
      })
      mockDb.subscription.findUnique.mockResolvedValueOnce({ tenantId: 'tenant-del' })
      mockDb.plan.findUnique.mockResolvedValueOnce({ id: 'plan-starter-id' })
      mockDb.subscription.update.mockResolvedValueOnce({})
      mockDb.tenant.update.mockResolvedValueOnce({})

      // Act
      const result = await service.handleWebhook(rawBody, signature)

      // Assert
      expect(result).toEqual({ received: true })
      expect(mockDb.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { stripeSubscriptionId: 'sub_deleted_1' },
          data: expect.objectContaining({ status: 'CANCELED' }),
        }),
      )
    })

    it('should process invoice.payment_failed and set subscription to PAST_DUE', async () => {
      // Arrange
      const invoice = buildStripeInvoice('inv_failed_1', 'sub_past_due', 'open', 2900)
      mockWebhooksConstructEvent.mockReturnValueOnce({
        type: 'invoice.payment_failed',
        id: 'evt_invoice_failed',
        data: { object: invoice },
      })
      mockDb.subscription.findUnique.mockResolvedValueOnce({
        id: 'sub-record-past-due',
        tenantId: 'tenant-billing',
      })
      mockDb.invoice.create.mockResolvedValueOnce({ id: 'invoice-failed-record' })
      mockDb.subscription.update.mockResolvedValueOnce({})

      // Act
      const result = await service.handleWebhook(rawBody, signature)

      // Assert
      expect(result).toEqual({ received: true })
      expect(mockDb.invoice.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            stripeInvoiceId: 'inv_failed_1',
            status: 'OPEN',
          }),
        }),
      )
      expect(mockDb.subscription.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sub-record-past-due' },
          data: { status: 'PAST_DUE' },
        }),
      )
    })

    it('should skip invoice.payment_failed when invoice has no subscription id', async () => {
      // Arrange — invoice sin subscription (e.g. one-time payment)
      const invoice = { ...buildStripeInvoice('inv_no_sub', null as unknown as string, 'open', 1000), subscription: null }
      mockWebhooksConstructEvent.mockReturnValueOnce({
        type: 'invoice.payment_failed',
        id: 'evt_no_sub',
        data: { object: invoice },
      })

      // Act
      const result = await service.handleWebhook(rawBody, signature)

      // Assert — se ignora el evento sin error
      expect(result).toEqual({ received: true })
      expect(mockDb.invoice.create).not.toHaveBeenCalled()
    })

    it('should throw InternalServerErrorException when DB throws during webhook processing', async () => {
      // Arrange — subscription.created pero la DB falla
      const subscription = buildStripeSubscription('sub_db_fail', 'active', 'tenant-fail', 'plan-x')
      mockWebhooksConstructEvent.mockReturnValueOnce({
        type: 'customer.subscription.created',
        id: 'evt_db_fail',
        data: { object: subscription },
      })
      mockDb.subscription.upsert.mockRejectedValueOnce(new Error('DB connection lost'))

      // Act & Assert — el error de DB convierte en InternalServerErrorException
      const { InternalServerErrorException } = await import('@nestjs/common')
      await expect(service.handleWebhook(rawBody, signature)).rejects.toThrow(
        InternalServerErrorException,
      )
    })
  })
})

// ─── Builders de objetos Stripe (stubs mínimos) ───────────────────────────────
//
// Estas funciones generan los campos mínimos necesarios para que
// BillingService procese el evento correctamente.
//

function buildStripeSubscription(
  id: string,
  status: string,
  tenantId: string,
  planId: string,
) {
  const now = Math.floor(Date.now() / 1000)
  return {
    id,
    status,
    customer: 'cus_test_xyz',
    metadata: { tenantId, planId },
    current_period_start: now,
    current_period_end: now + 30 * 24 * 60 * 60, // +30 días
    cancel_at_period_end: false,
  }
}

function buildStripeInvoice(
  id: string,
  subscriptionId: string,
  status: string,
  amountPaid: number,
) {
  return {
    id,
    subscription: subscriptionId,
    status,
    amount_paid: amountPaid,
    amount_due: amountPaid,
    currency: 'usd',
    invoice_pdf: `https://stripe.com/invoice/${id}.pdf`,
  }
}
