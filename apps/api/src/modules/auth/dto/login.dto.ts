import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

/**
 * SEC-05 — DTO de login.
 *
 * Limitar longitudes evita ataques de payload gigante contra bcrypt
 * (un password muy largo puede generar carga de CPU intencional).
 */
export class LoginDto {
  @ApiProperty({ example: 'usuario@ejemplo.com' })
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  @MaxLength(255)
  email: string

  @ApiProperty()
  @IsString()
  @MinLength(1, { message: 'La contraseña es requerida' })
  @MaxLength(72, { message: 'La contraseña no puede superar 72 caracteres' })
  password: string
}
