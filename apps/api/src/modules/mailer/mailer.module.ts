import { Module } from '@nestjs/common'
import { MailerService } from './mailer.service'

/**
 * MailerModule — email transaccional via Resend.
 *
 * Requiere en .env:
 *   RESEND_API_KEY=re_xxxxxxxxxxxx
 *   RESEND_FROM_EMAIL=EdithPress <noreply@edithpress.com>  (opcional)
 *
 * En dev local (sin RESEND_API_KEY): los emails se imprimen en consola.
 */
@Module({
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
