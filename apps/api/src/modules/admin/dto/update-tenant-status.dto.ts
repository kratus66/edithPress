import { IsBoolean } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateTenantStatusDto {
  @ApiProperty()
  @IsBoolean()
  isActive!: boolean
}
