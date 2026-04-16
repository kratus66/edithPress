import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { TenantGuard } from '../../common/guards/tenant.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { PaginationDto } from '../../common/dto/pagination.dto'
import { MediaService } from './media.service'
import type { JwtPayload } from '../auth/strategies/jwt.strategy'

class UploadMediaDto {
  @ApiPropertyOptional({ description: 'Texto alternativo para accesibilidad' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  altText?: string
}

@ApiTags('Media')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  // ──────────── POST /media/upload ──

  @Post('upload')
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'EDITOR')
  @UseInterceptors(FileInterceptor('file', { storage: undefined })) // memoria (buffer) para subir a S3
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        altText: { type: 'string' },
      },
    },
  })
  @ApiOperation({ summary: 'Subir un archivo (imagen, PDF o video) a S3' })
  async upload(
    @CurrentUser() user: JwtPayload,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // 100 MB es el máximo absoluto — la validación por tipo está en el servicio
          new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() body: UploadMediaDto,
  ) {
    return { data: await this.mediaService.upload(user.tenantId, user.sub, file, body.altText) }
  }

  // ──────────── GET /media ──

  @Get()
  @ApiOperation({ summary: 'Listar archivos de media del tenant' })
  async findAll(
    @CurrentUser() user: JwtPayload,
    @Query() pagination: PaginationDto,
  ) {
    const result = await this.mediaService.findAll(user.tenantId, pagination)
    return {
      data: result.items,
      meta: { page: result.page, limit: result.limit, total: result.total },
    }
  }

  // ──────────── DELETE /media/:id ──

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'EDITOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un archivo de media (S3 + BD)' })
  async remove(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    await this.mediaService.remove(id, user.tenantId)
  }
}
