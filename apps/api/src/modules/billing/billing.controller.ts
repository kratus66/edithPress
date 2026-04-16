import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
  UseGuards,
  RawBodyRequest,
} from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import type { Request } from 'express'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { TenantGuard } from '../../common/guards/tenant.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import type { JwtPayload } from '../auth/strategies/jwt.strategy'
import { BillingService } from './billing.service'
import { CreateCheckoutDto } from './dto/create-checkout.dto'

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // ── POST /billing/checkout ──────────────────────────────────────────────

  @Post('checkout')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Crear Stripe Checkout Session',
    description:
      'Retorna la URL de la sesión de pago de Stripe. ' +
      'El frontend redirige al usuario a esa URL para completar el pago.',
  })
  @ApiResponse({ status: 201, description: 'URL del checkout generada' })
  @ApiResponse({ status: 404, description: 'Plan no encontrado' })
  async createCheckout(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateCheckoutDto,
  ) {
    return { data: await this.billingService.createCheckoutSession(user, dto) }
  }

  // ── GET /billing/portal ─────────────────────────────────────────────────

  @Get('portal')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Obtener URL del Customer Portal de Stripe',
    description:
      'El tenant puede gestionar su suscripción, cambiar de plan, ' +
      'actualizar método de pago o cancelar desde el portal de Stripe.',
  })
  @ApiResponse({ status: 200, description: 'URL del portal generada' })
  @ApiResponse({ status: 404, description: 'Sin suscripción activa' })
  async getPortal(@CurrentUser() user: JwtPayload) {
    return { data: await this.billingService.getPortalUrl(user) }
  }

  // ── POST /billing/webhook ───────────────────────────────────────────────

  /**
   * Endpoint de webhook de Stripe.
   *
   * CRÍTICO — sin JwtAuthGuard, sin TenantGuard, sin ThrottlerGuard.
   * La autenticación se hace verificando la firma HMAC de Stripe con
   * el STRIPE_WEBHOOK_SECRET via stripe.webhooks.constructEvent().
   *
   * El raw body llega en req.rawBody (configurado en main.ts).
   * Si NestJS parseara el JSON antes de aquí, la verificación de firma fallaría.
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @SkipThrottle()
  @ApiOperation({
    summary: 'Webhook de Stripe (solo para Stripe)',
    description: 'Procesa eventos de Stripe. Requiere header stripe-signature válido.',
  })
  @ApiResponse({ status: 200, description: 'Evento procesado' })
  @ApiResponse({ status: 400, description: 'Firma inválida o evento malformado' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody
    if (!rawBody) {
      // Si no hay rawBody, el middleware no está configurado correctamente
      throw new Error(
        'rawBody no disponible — verificar configuración de rawBody en main.ts',
      )
    }
    return this.billingService.handleWebhook(rawBody, signature)
  }
}
