import { IsString, MinLength, MaxLength, Matches, IsOptional, IsUrl } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateTenantDto {
  @ApiPropertyOptional({ example: 'Mi Empresa Actualizada' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string

  @ApiPropertyOptional({ example: 'mi-empresa-v2' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(63)
  @Matches(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, {
    message: 'El slug solo puede contener letras minúsculas, números y guiones (no al inicio/fin)',
  })
  slug?: string

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png' })
  @IsOptional()
  @IsUrl({}, { message: 'logoUrl debe ser una URL válida' })
  @MaxLength(500)
  logoUrl?: string
}
