import { IsString, IsOptional, MinLength, MaxLength, IsObject, IsUrl } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateSiteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({}, { message: 'favicon debe ser una URL válida' })
  @MaxLength(500)
  favicon?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  templateId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>
}
