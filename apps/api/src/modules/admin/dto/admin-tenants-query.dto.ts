import { IsOptional, IsString, IsIn } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { PaginationDto } from '../../../common/dto/pagination.dto'

export class AdminTenantsQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Buscar por nombre o slug' })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ enum: ['active', 'inactive'] })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive'
}
