import { IsOptional, IsInt, IsBoolean, IsNumber, Min } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class UpdatePlanLimitsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-1)
  maxSites?: number

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(-1)
  maxPages?: number

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxStorageGB?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasCustomDomain?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasEcommerce?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasAnalytics?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasWhiteLabel?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMonthly?: number

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceYearly?: number
}
