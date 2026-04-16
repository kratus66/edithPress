import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { PrismaClient } from '@edithpress/database'

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name)

  async onModuleInit() {
    await this.$connect()
    this.logger.log('Conexión con la base de datos establecida')
  }

  async onModuleDestroy() {
    await this.$disconnect()
    this.logger.log('Conexión con la base de datos cerrada')
  }
}
