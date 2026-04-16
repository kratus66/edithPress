import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

/** Guard que protege rutas con JWT. Uso: @UseGuards(JwtAuthGuard) */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
