import { IsArray } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class SaveContentDto {
  @ApiProperty({
    description: 'Array de bloques del page builder (formato Puck)',
    example: [
      { type: 'HeroBlock', props: { title: 'Bienvenido', subtitle: 'Subtítulo' } },
    ],
  })
  @IsArray()
  blocks: unknown[]
}
