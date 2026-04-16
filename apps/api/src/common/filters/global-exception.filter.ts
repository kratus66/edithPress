import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import type { Request, Response } from 'express'

const HTTP_STATUS_CODES: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'UNPROCESSABLE_ENTITY',
  429: 'TOO_MANY_REQUESTS',
  500: 'INTERNAL_SERVER_ERROR',
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR
    let code = 'INTERNAL_SERVER_ERROR'
    let message = 'Ha ocurrido un error inesperado'

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>
        code = typeof resp['code'] === 'string'
          ? resp['code']
          : (HTTP_STATUS_CODES[statusCode] ?? 'UNKNOWN_ERROR')
        // class-validator devuelve message como array; tomamos el primero
        const rawMessage = resp['message']
        message = Array.isArray(rawMessage)
          ? (rawMessage[0] as string)
          : (typeof rawMessage === 'string' ? rawMessage : exception.message)
      } else {
        code = HTTP_STATUS_CODES[statusCode] ?? 'UNKNOWN_ERROR'
        message = exception.message
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `[${request.method}] ${request.url} — ${exception.message}`,
        exception.stack,
      )
    } else {
      this.logger.error(`Excepción desconocida: ${String(exception)}`)
    }

    response.status(statusCode).json({
      error: {
        code,
        // En producción, 500s muestran mensaje genérico para no filtrar internals
        message:
          process.env.NODE_ENV === 'production' && statusCode === 500
            ? 'Internal server error'
            : message,
        statusCode,
      },
    })
  }
}
