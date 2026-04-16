import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { AppModule } from './app.module'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'

async function bootstrap() {
  // rawBody: true — guarda el buffer original en req.rawBody para verificar
  // la firma HMAC del webhook de Stripe (POST /billing/webhook).
  // No afecta el body parsing normal del resto de endpoints.
  const app = await NestFactory.create(AppModule, { rawBody: true })

  // SEC-02 — HTTP security headers (Helmet configurado según spec de seguridad)
  app.use(helmet({
    // X-Frame-Options: DENY — bloquea clickjacking completamente
    frameguard: { action: 'deny' },
    // Referrer-Policy: strict-origin-when-cross-origin
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    // HSTS: 1 año (365 días) con includeSubDomains
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
    },
    // Permissions-Policy: desactiva cámara, micrófono y geolocalización
    permittedCrossDomainPolicies: false,
  }))

  // SEC-02 — Permissions-Policy (no cubierto por Helmet directamente)
  app.use((_req: any, res: any, next: any) => {
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    next()
  })

  // SEC-02 — Habilitar lectura de cookies (necesario para refresh tokens en httpOnly cookies)
  app.use(cookieParser())

  // CORS: permite solo el origin del frontend
  app.enableCors({
    origin: process.env.APP_URL ?? 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })

  // Filtro global de excepciones — formato { error: { code, message, statusCode } }
  app.useGlobalFilters(new GlobalExceptionFilter())

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // elimina campos no declarados en el DTO
      forbidNonWhitelisted: true, // lanza error si llegan campos extra
      transform: true,            // convierte tipos automáticamente (string → number, etc.)
    }),
  )

  // Prefijo global: todos los endpoints quedan bajo /api/v1
  app.setGlobalPrefix('api/v1')

  // Swagger — solo en desarrollo (API-04)
  if (process.env.NODE_ENV !== 'production') {
    const { DocumentBuilder, SwaggerModule } = await import('@nestjs/swagger')
    const config = new DocumentBuilder()
      .setTitle('EdithPress API')
      .setDescription('REST API del SaaS CMS EdithPress')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'access-token',
      )
      .addApiKey(
        { type: 'apiKey', name: 'X-Tenant-ID', in: 'header' },
        'X-Tenant-ID',
      )
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api/docs', app, document)
    console.log('📄 Swagger disponible en http://localhost:3001/api/docs')
  }

  const port = process.env.PORT ?? 3001
  await app.listen(port)
  console.log(`🚀 API corriendo en http://localhost:${port}/api/v1`)
}

bootstrap()
