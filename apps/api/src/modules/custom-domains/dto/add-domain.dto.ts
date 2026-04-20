import { IsString, Matches, MaxLength } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

/**
 * DTO para agregar un dominio personalizado a un sitio.
 *
 * El regex valida:
 * - Empieza y termina con alfanumérico
 * - Puede contener guiones en el medio (no al inicio/fin de cada etiqueta)
 * - Tiene al menos un punto con TLD de 2+ caracteres
 *
 * Rechaza: localhost, IPs, wildcards.
 */
export class AddDomainDto {
  @ApiProperty({ example: 'mi-empresa.com', description: 'Nombre de dominio personalizado' })
  @IsString()
  @MaxLength(253)
  @Matches(
    /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/,
    {
      message:
        'El dominio no es válido. Usa el formato: mi-empresa.com o subdominio.empresa.com',
    },
  )
  domain: string
}
