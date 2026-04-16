import { Controller, Get } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

@ApiTags('health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check de la API' })
  @ApiResponse({
    status: 200,
    description: 'La API está disponible',
    schema: {
      example: { status: 'ok', timestamp: '2026-04-13T00:00:00.000Z' },
    },
  })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    }
  }
}
