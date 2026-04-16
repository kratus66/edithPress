import { Injectable, NotFoundException, Logger } from '@nestjs/common'
import { DatabaseService } from '../database/database.service'
import type { SaveContentDto } from './dto/save-content.dto'

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name)

  constructor(private readonly db: DatabaseService) {}

  /**
   * Verifica que la página existe y pertenece al tenant.
   * Navega Page → Site → tenantId para garantizar aislamiento.
   */
  private async verifyPageOwnership(pageId: string, tenantId: string) {
    const page = await this.db.page.findFirst({
      where: {
        id: pageId,
        site: { tenantId },
      },
      select: { id: true, content: true },
    })
    if (!page) throw new NotFoundException('Página no encontrada')
    return page
  }

  // ──────────────────────────────────────── GET ──

  async getContent(pageId: string, tenantId: string) {
    const page = await this.verifyPageOwnership(pageId, tenantId)
    return { pageId, blocks: page.content }
  }

  // ──────────────────────────────────────── SAVE ──

  /**
   * Guarda el contenido del page builder y crea una PageVersion del estado anterior.
   * Esto permite el historial de versiones en el módulo de páginas.
   */
  async saveContent(pageId: string, tenantId: string, dto: SaveContentDto, userId: string) {
    const page = await this.verifyPageOwnership(pageId, tenantId)

    await this.db.$transaction([
      // 1. Guardar el contenido anterior como versión
      this.db.pageVersion.create({
        data: {
          pageId,
          content: page.content,
          createdBy: userId,
        },
      }),
      // 2. Actualizar el contenido actual
      this.db.page.update({
        where: { id: pageId },
        data: { content: dto.blocks as object[] },
      }),
    ])

    this.logger.log(`Contenido guardado: pageId=${pageId} userId=${userId}`)
    return { pageId, blocks: dto.blocks }
  }
}
