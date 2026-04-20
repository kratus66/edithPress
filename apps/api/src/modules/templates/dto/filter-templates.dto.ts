import { IsOptional, IsString, IsBooleanString, MaxLength, IsInt, Min, Max } from 'class-validator'
import { Transform, Type } from 'class-transformer'
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

  @ApiPropertyOptional({
    description: 'Número de página (empieza en 1)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({
    description: 'Cantidad de items por página (máx 50)',
    example: 12,
    default: 12,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 12
}
