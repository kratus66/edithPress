import { IsFQDN, IsString, IsNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateDomainDto {
  @ApiProperty({ example: 'www.miempresa.com' })
  @IsFQDN()
  domain: string

  @ApiProperty({ description: 'ID del sitio al que se asigna el dominio' })
  @IsString()
  @IsNotEmpty()
  siteId: string
}
