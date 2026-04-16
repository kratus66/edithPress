import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { UsersService } from './users.service'
import { UpdateUserDto } from './dto/update-user.dto'
import type { JwtPayload } from '../auth/strategies/jwt.strategy'

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ─────────────────────────────────────────────────── GET /users/me ──

  @Get('me')
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil del usuario' })
  async getMe(@CurrentUser() user: JwtPayload) {
    return { data: await this.usersService.findById(user.sub) }
  }

  // ─────────────────────────────────────────────────── PATCH /users/me ──

  @Patch('me')
  @ApiOperation({ summary: 'Actualizar perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado' })
  async updateMe(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateUserDto,
  ) {
    return { data: await this.usersService.update(user.sub, dto) }
  }

  // ─────────────────────────────────────────────────── DELETE /users/me ──

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar cuenta del usuario autenticado (soft-delete)' })
  @ApiResponse({ status: 204, description: 'Cuenta eliminada' })
  async deleteMe(@CurrentUser() user: JwtPayload) {
    await this.usersService.remove(user.sub)
  }
}
