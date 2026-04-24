import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { DatabaseModule } from './modules/database/database.module'
import { RedisModule } from './modules/redis/redis.module'
import { MailerModule } from './modules/mailer/mailer.module'
import { HealthModule } from './modules/health/health.module'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { TenantsModule } from './modules/tenants/tenants.module'
import { SitesModule } from './modules/sites/sites.module'
import { PagesModule } from './modules/pages/pages.module'
import { ContentModule } from './modules/content/content.module'
import { MediaModule } from './modules/media/media.module'
import { RendererModule } from './modules/renderer/renderer.module'
import { TemplatesModule } from './modules/templates/templates.module'
import { BillingModule } from './modules/billing/billing.module'
import { AdminModule } from './modules/admin/admin.module'
import { CustomDomainsModule } from './modules/custom-domains/custom-domains.module'
import { AnalyticsModule } from './modules/analytics/analytics.module'
import { NewsletterModule } from './modules/newsletter/newsletter.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env', '../../.env.local', '../../.env'],
    }),

    // Rate limiting global: 100 requests por minuto por IP
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),

    // Infraestructura global (disponible en todos los módulos sin importar)
    DatabaseModule,
    RedisModule,    // @Global — RedisService inyectable en toda la app
    MailerModule,   // Email transaccional vía Resend

    HealthModule,
    AuthModule,
    UsersModule,
    TenantsModule,
    SitesModule,
    PagesModule,
    ContentModule,
    MediaModule,
    RendererModule,
    TemplatesModule,
    BillingModule,
    AdminModule,
    CustomDomainsModule,
    AnalyticsModule,
    NewsletterModule,
  ],
  providers: [
    // ThrottlerGuard aplicado globalmente a todos los endpoints
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
