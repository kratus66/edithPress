import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

/** Guard para el endpoint de login — valida email+password via LocalStrategy. */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
