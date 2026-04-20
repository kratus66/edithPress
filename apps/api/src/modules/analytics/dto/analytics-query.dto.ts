import { IsOptional, IsIn } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export type AnalyticsPeriod = '7d' | '30d' | '90d'

export class AnalyticsQueryDto {
  @ApiPropertyOptional({
    description: 'Período de análisis',
    enum: ['7d', '30d', '90d'],
    default: '30d',
  })
  @IsOptional()
  @IsIn(['7d', '30d', '90d'])
  period?: AnalyticsPeriod = '30d'
}
