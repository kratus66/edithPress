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
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdatePageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'El slug solo puede contener letras minúsculas, números y guiones',
  })
  slug?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(70)
  metaTitle?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  metaDesc?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({}, { message: 'ogImage debe ser una URL válida' })
  @MaxLength(500)
  ogImage?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isHomepage?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number
}
