import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { DatabaseModule } from './modules/database/database.module'
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

@Module({
  imports: [
    // Variables de entorno disponibles en toda la app via ConfigService
    ConfigModule.forRoot({
      isGlobal: true,
      // Supports running from monorepo root (turbo) or directly from apps/api/
      envFilePath: ['.env.local', '.env', '../../.env.local', '../../.env'],
    }),

    // Rate limiting global: 100 requests por minuto por IP
    // Los módulos pueden sobreescribir con @Throttle()
    ThrottlerModule.forRoot([
      {
        ttl: 60_000, // 1 minuto en ms
        limit: 100,
      },
    ]),

    DatabaseModule,
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
