import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator'
import { Transform } from 'class-transformer'

export class SubscribeDto {
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  email: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  source?: string
}

export class UnsubscribeDto {
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  @Transform(({ value }: { value: string }) => value?.toLowerCase().trim())
  email: string

  @IsString()
  token: string
}
