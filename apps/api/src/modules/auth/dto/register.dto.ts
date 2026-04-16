import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

/**
 * SEC-01 / SEC-05 — DTO de registro.
 *
 * Validaciones de seguridad:
 * - Email normalizado (class-transformer lo transforma a lowercase)
 * - Password: mínimo 8 caracteres, máximo 72 (límite de bcrypt),
 *   debe incluir al menos una letra y un número para descartar
 *   contraseñas triviales de un solo tipo de carácter.
 * - Nombres: longitud máxima para evitar payloads abusivos.
 */
export class RegisterDto {
  @ApiProperty({ example: 'usuario@ejemplo.com' })
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  @MaxLength(255)
  email: string

  @ApiProperty({ example: 'MiContraseña123', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(72, { message: 'La contraseña no puede superar 72 caracteres' })
  // Al menos una letra y un número
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, {
    message: 'La contraseña debe contener al menos una letra y un número',
  })
  password: string

  @ApiPropertyOptional({ example: 'Juan' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string

  @ApiPropertyOptional({ example: 'García' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string
}
