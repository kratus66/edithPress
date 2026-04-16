import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsUrl,
  MinLength,
  MaxLength,
  Matches,
  Min,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreatePageDto {
  @ApiProperty({ example: 'Sobre nosotros' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title: string

  @ApiProperty({
    example: 'sobre-nosotros',
    description: 'Slug único en el sitio. Solo letras minúsculas, números y guiones.',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'El slug solo puede contener letras minúsculas, números y guiones',
  })
  slug: string

  @ApiPropertyOptional({ example: 'Sobre nosotros | Mi Empresa' })
  @IsOptional()
  @IsString()
  @MaxLength(70)
  metaTitle?: string

  @ApiPropertyOptional({ example: 'Conoce al equipo detrás de Mi Empresa.' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  metaDesc?: string

  @ApiPropertyOptional({ description: 'URL de la imagen Open Graph' })
  @IsOptional()
  @IsUrl({}, { message: 'ogImage debe ser una URL válida' })
  @MaxLength(500)
  ogImage?: string

  @ApiPropertyOptional({ default: false, description: '¿Es la página de inicio?' })
  @IsOptional()
  @IsBoolean()
  isHomepage?: boolean

  @ApiPropertyOptional({ default: 0, description: 'Orden en la navegación' })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number
}
