import { IsString, MinLength, MaxLength, Matches, IsOptional, IsUrl } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateTenantDto {
  @ApiProperty({ example: 'Mi Empresa S.L.' })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100)
  name: string

  @ApiProperty({
    example: 'mi-empresa',
    description: 'Slug único: solo letras minúsculas, números y guiones. No puede empezar ni terminar con guión.',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(63)
  @Matches(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, {
    message: 'El slug solo puede contener letras minúsculas, números y guiones (no al inicio/fin)',
  })
  slug: string

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png' })
  @IsOptional()
  @IsUrl({}, { message: 'logoUrl debe ser una URL válida' })
  @MaxLength(500)
  logoUrl?: string
}
