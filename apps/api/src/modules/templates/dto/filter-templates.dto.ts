import { IsOptional, IsString, IsBooleanString, MaxLength } from 'class-validator'
import { Transform } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class FilterTemplatesDto {
  @ApiPropertyOptional({
    description: 'Filtrar por categoría (ej: "restaurante", "portfolio", "landing")',
    example: 'restaurante',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string

  /**
   * "true" o "false" como string — viene de query param.
   * Se transforma a boolean con @Transform.
   */
  @ApiPropertyOptional({
    description: 'Filtrar solo templates premium (true) o gratuitos (false)',
    example: 'false',
  })
  @IsOptional()
  @IsBooleanString()
  @Transform(({ value }) => value === 'true')
  isPremium?: boolean
}
