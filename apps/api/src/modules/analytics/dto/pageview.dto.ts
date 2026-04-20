import { IsString, IsOptional, MaxLength, IsNotEmpty, Matches } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreatePageViewDto {
  @ApiProperty({ description: 'ID del sitio', example: 'clx1a2b3...' })
  @IsString()
  @IsNotEmpty()
  siteId: string

  @ApiProperty({ description: 'Path de la página visitada', example: '/blog/mi-articulo' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  // SEC — valida que el path sea una ruta URL válida.
  // Acepta: '/', '/blog/mi-articulo', '/path?q=1#section'
  // Rechaza: valores que no empiecen con '/' o contengan caracteres de control.
  @Matches(/^\/[^\x00-\x1f\x7f]*$/, {
    message: 'El path debe comenzar con / y no puede contener caracteres de control',
  })
  path: string

  @ApiPropertyOptional({ description: 'URL de referencia', example: 'https://google.com' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  referrer?: string

  @ApiPropertyOptional({ description: 'User-Agent del navegador' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  userAgent?: string
}
