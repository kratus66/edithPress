import { IsString, IsNotEmpty, IsIn } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateCheckoutDto {
  @ApiProperty({
    description: 'ID del plan al que se quiere suscribir',
    example: 'clx1a2b3c4d5e6f7g8h9i0j1k',
  })
  @IsString()
  @IsNotEmpty()
  planId: string

  @ApiProperty({
    description: 'Frecuencia de facturación',
    enum: ['monthly', 'yearly'],
    example: 'monthly',
  })
  @IsIn(['monthly', 'yearly'])
  interval: 'monthly' | 'yearly'
}
