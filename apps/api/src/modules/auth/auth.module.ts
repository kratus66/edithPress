import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { JwtStrategy } from './strategies/jwt.strategy'
import { LocalStrategy } from './strategies/local.strategy'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { DatabaseModule } from '../database/database.module'
import { MailerModule } from '../mailer/mailer.module'
import { ACCESS_TOKEN_TTL_SECONDS } from './constants/auth.constants'

@Module({
  imports: [
    DatabaseModule,
    MailerModule,

    PassportModule.register({ defaultStrategy: 'jwt' }),

    // SEC-01 — JWT configurado de forma asíncrona para leer JWT_SECRET
    // desde variables de entorno (nunca hardcodeado)
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET')
        if (!secret) throw new Error('JWT_SECRET no definido')
        return {
          secret,
          signOptions: {
            expiresIn: ACCESS_TOKEN_TTL_SECONDS,
            algorithm: 'HS256',
          },
        }
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    JwtAuthGuard,
    LocalAuthGuard,
  ],
  exports: [AuthService, JwtAuthGuard, JwtModule, PassportModule],
})
export class AuthModule {}
