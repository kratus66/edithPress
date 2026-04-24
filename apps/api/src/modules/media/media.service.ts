import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'
import { extname } from 'path'
import { DatabaseService } from '../database/database.service'
import type { PaginationDto } from '../../common/dto/pagination.dto'

// ── Tipos permitidos ────────────────────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
const ALLOWED_DOC_TYPES = ['application/pdf']
const ALLOWED_VIDEO_TYPES = ['video/mp4']

const MAX_IMAGE_SIZE = 10 * 1024 * 1024   // 10 MB
const MAX_DOC_SIZE = 25 * 1024 * 1024     // 25 MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024  // 100 MB

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name)
  private readonly s3: S3Client
  private readonly bucket: string

  constructor(
    private readonly db: DatabaseService,
    private readonly config: ConfigService,
  ) {
    this.s3 = new S3Client({
      region: this.config.get<string>('AWS_REGION') ?? 'us-east-1',
      credentials: {
        accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID') ?? '',
        secretAccessKey: this.config.get<string>('AWS_SECRET_ACCESS_KEY') ?? '',
      },
      // Soporte para S3-compatible (R2, MinIO en dev)
      ...(this.config.get('AWS_ENDPOINT') && {
        endpoint: this.config.get<string>('AWS_ENDPOINT'),
        forcePathStyle: true,
      }),
    })
    this.bucket = this.config.get<string>('AWS_BUCKET_NAME') ?? ''
  }

  // ──────────────────────────────────────── VALIDATION ──

  private validateFile(mimeType: string, size: number): void {
    const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType)
    const isDoc = ALLOWED_DOC_TYPES.includes(mimeType)
    const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType)

    if (!isImage && !isDoc && !isVideo) {
      throw new BadRequestException({
        code: 'UNSUPPORTED_FILE_TYPE',
        message: `Tipo de archivo no permitido: ${mimeType}`,
      })
    }

    if (isImage && size > MAX_IMAGE_SIZE) {
      throw new BadRequestException({
        code: 'FILE_TOO_LARGE',
        message: 'Las imágenes no pueden superar 10 MB',
      })
    }

    if (isDoc && size > MAX_DOC_SIZE) {
      throw new BadRequestException({
        code: 'FILE_TOO_LARGE',
        message: 'Los documentos PDF no pueden superar 25 MB',
      })
    }

    if (isVideo && size > MAX_VIDEO_SIZE) {
      throw new BadRequestException({
        code: 'FILE_TOO_LARGE',
        message: 'Los videos no pueden superar 100 MB',
      })
    }
  }

  // ──────────────────────────────────────── UPLOAD ──

  async upload(
    tenantId: string,
    userId: string,
    file: Express.Multer.File,
    altText?: string,
  ) {
    this.validateFile(file.mimetype, file.size)

    const ext = extname(file.originalname).toLowerCase()
    const s3Key = `${tenantId}/${randomUUID()}${ext}`

    // Subir a S3 / R2 / MinIO
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentLength: file.size,
      }),
    )

    const endpoint = this.config.get<string>('AWS_ENDPOINT')
    const cdnBase = this.config.get<string>('AWS_CDN_URL')
      ?? (endpoint ? `${endpoint}/${this.bucket}` : `https://${this.bucket}.s3.amazonaws.com`)
    const url = `${cdnBase}/${s3Key}`

    const media = await this.db.mediaFile.create({
      data: {
        tenantId,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
        url,
        s3Key,
        altText: altText ?? null,
        uploadedBy: userId,
      },
    })

    this.logger.log(`Media subida: mediaId=${media.id} tenantId=${tenantId}`)
    return media
  }

  // ──────────────────────────────────────── LIST ──

  async findAll(tenantId: string, pagination: PaginationDto, type?: string) {
    const page = pagination.page ?? 1
    const limit = pagination.limit ?? 20

    const typeFilter = type === 'image'
      ? { startsWith: 'image/' }
      : type === 'video'
        ? { startsWith: 'video/' }
        : type === 'document'
          ? { startsWith: 'application/' }
          : undefined

    const where = { tenantId, ...(typeFilter ? { fileType: typeFilter } : {}) }

    const [items, total] = await this.db.$transaction([
      this.db.mediaFile.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.db.mediaFile.count({ where }),
    ])

    return { items, total, page, limit }
  }

  // ──────────────────────────────────────── DELETE ──

  async remove(mediaId: string, tenantId: string): Promise<void> {
    const media = await this.db.mediaFile.findFirst({
      where: { id: mediaId, tenantId },
    })
    if (!media) throw new NotFoundException('Archivo no encontrado')

    // Eliminar de S3 primero (si falla, no eliminamos de la BD)
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: media.s3Key,
      }),
    )

    await this.db.mediaFile.delete({ where: { id: mediaId } })
    this.logger.log(`Media eliminada: mediaId=${mediaId}`)
  }
}
