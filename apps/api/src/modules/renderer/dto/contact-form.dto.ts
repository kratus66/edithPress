import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class ContactFormDto {
  /** Slug del tenant al que se dirige el mensaje (subdominio del sitio). */
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  tenantSlug: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string

  @IsEmail()
  email: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string
}
