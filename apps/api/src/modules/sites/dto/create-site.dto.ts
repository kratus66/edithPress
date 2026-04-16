import { IsString, IsOptional, MinLength, MaxLength, IsObject, IsUrl } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateSiteDto {
  @ApiProperty({ example: 'Mi Sitio Web' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string

  @ApiPropertyOptional({ example: 'Sitio corporativo de Mi Empresa' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string

  @ApiPropertyOptional({ description: 'URL del favicon' })
  @IsOptional()
  @IsUrl({}, { message: 'favicon debe ser una URL válida' })
  @MaxLength(500)
  favicon?: string

  @ApiPropertyOptional({ description: 'ID del template a aplicar' })
  @IsOptional()
  @IsString()
  templateId?: string

  @ApiPropertyOptional({
    description: 'Configuración libre: SEO global, colores, analytics IDs, etc.',
    example: { primaryColor: '#6366f1', googleAnalyticsId: 'G-XXXXXXXX' },
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>
}
