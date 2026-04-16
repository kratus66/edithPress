import { Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import type { UpdateUserDto } from './dto/update-user.dto'

/** Campos del usuario que se pueden exponer al cliente (nunca passwordHash). */
const USER_PUBLIC_SELECT = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  emailVerified: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  tenantUsers: {
    select: {
      tenantId: true,
      role: true,
    },
  },
} as const

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Busca un usuario por su ID y retorna solo campos públicos.
   * Lanza NotFoundException si no existe (no debe ocurrir en rutas autenticadas,
   * pero puede pasar si la cuenta fue eliminada entre requests).
   */
  async findById(userId: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: USER_PUBLIC_SELECT,
    })

    if (!user) throw new NotFoundException('Usuario no encontrado')
    return user
  }

  /** Actualiza campos de perfil. Solo actualiza los campos enviados (PATCH semántico). */
  async update(userId: string, dto: UpdateUserDto) {
    return this.db.user.update({
      where: { id: userId },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
      },
      select: USER_PUBLIC_SELECT,
    })
  }

  /**
   * Soft-delete de la cuenta del usuario.
   * - Marca isActive = false (el usuario no puede volver a hacer login)
   * - Invalida todos sus refresh tokens
   * Usa transacción para atomicidad.
   */
  async remove(userId: string): Promise<void> {
    await this.db.$transaction([
      this.db.user.update({
        where: { id: userId },
        data: { isActive: false },
      }),
      this.db.refreshToken.deleteMany({
        where: { userId },
      }),
    ])
  }
}
