import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token recibido en el email de restablecimiento' })
  @IsString()
  @IsNotEmpty({ message: 'El token es requerido' })
  token: string

  @ApiProperty({ description: 'Nueva contraseña (mínimo 8 caracteres)', minLength: 8 })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
  })
  password: string
}
