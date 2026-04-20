import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Resend } from 'resend'

export interface ContactFormEmailOpts {
  siteOwnerEmail: string
  fromName: string
  fromEmail: string
  message: string
}

/**
 * MailerService — email transaccional vía Resend.
 *
 * Comportamiento en dev (sin RESEND_API_KEY):
 *   imprime el contenido del email en el logger en lugar de enviarlo.
 *
 * Comportamiento en producción (con RESEND_API_KEY):
 *   envía usando el SDK oficial de Resend.
 */
@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name)
  private readonly resend: Resend | null
  private readonly from: string
  private readonly appUrl: string

  constructor(private readonly config: ConfigService) {
    const apiKey = config.get<string>('RESEND_API_KEY')
    this.from = config.get<string>('RESEND_FROM_EMAIL') ?? 'EdithPress <noreply@edithpress.com>'
    this.appUrl = config.get<string>('APP_URL') ?? 'http://localhost:3000'

    if (apiKey) {
      this.resend = new Resend(apiKey)
    } else {
      this.resend = null
      this.logger.warn('RESEND_API_KEY no configurado — los emails se mostrarán en consola (modo dev)')
    }
  }

  // ──────────────────────────────────────── TEMPLATES ──

  /**
   * Email de verificación de cuenta.
   * Se envía al registrarse — el token es un JWT válido 24h.
   */
  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const link = `${this.appUrl}/auth/verify-email?token=${encodeURIComponent(token)}`
    const subject = 'Verifica tu cuenta en EdithPress'
    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <h2 style="color:#1e1b4b">Verifica tu cuenta</h2>
        <p>Gracias por registrarte en EdithPress. Haz clic en el botón para activar tu cuenta:</p>
        <a href="${link}"
           style="display:inline-block;margin:16px 0;padding:12px 24px;background:#6366f1;color:#fff;text-decoration:none;border-radius:6px;font-weight:600">
          Verificar email
        </a>
        <p style="color:#6b7280;font-size:14px">El enlace expira en 24 horas. Si no creaste esta cuenta, ignora este mensaje.</p>
      </div>
    `
    await this.send(to, subject, html)
  }

  /**
   * Email de restablecimiento de contraseña.
   * Token: string opaco de 64 chars (hex), válido 1 hora.
   */
  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const link = `${this.appUrl}/reset-password?token=${encodeURIComponent(token)}`
    const subject = 'Restablecer contraseña — EdithPress'
    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <h2 style="color:#1e1b4b">Restablecer contraseña</h2>
        <p>Recibimos una solicitud para cambiar la contraseña de tu cuenta en EdithPress.</p>
        <a href="${link}"
           style="display:inline-block;margin:16px 0;padding:12px 24px;background:#6366f1;color:#fff;text-decoration:none;border-radius:6px;font-weight:600">
          Crear nueva contraseña
        </a>
        <p style="color:#6b7280;font-size:14px">Este enlace expira en <strong>1 hora</strong>. Si no solicitaste este cambio, ignora este mensaje — tu contraseña actual sigue siendo válida.</p>
      </div>
    `
    await this.send(to, subject, html)
  }

  /**
   * Email de notificación al propietario del sitio cuando alguien envía el ContactForm.
   */
  async sendContactFormEmail(opts: ContactFormEmailOpts): Promise<void> {
    const { siteOwnerEmail, fromName, fromEmail, message } = opts
    const subject = 'Nuevo mensaje desde tu sitio — EdithPress'
    const safeMessage = message.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')
    const html = `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <h2 style="color:#1e1b4b">Nuevo mensaje de contacto</h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#6b7280;width:80px">De:</td>
              <td><strong>${fromName}</strong> (${fromEmail})</td></tr>
        </table>
        <hr style="border:1px solid #e5e7eb;margin:16px 0">
        <p>${safeMessage}</p>
      </div>
    `
    await this.send(siteOwnerEmail, subject, html)
  }

  // ──────────────────────────────────────── PRIVADO ──

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (!this.resend) {
      // Dev mode: imprimir en consola para facilitar pruebas sin config de Resend
      this.logger.debug(`[mailer] Para: ${to}`)
      this.logger.debug(`[mailer] Asunto: ${subject}`)
      this.logger.debug(`[mailer] Link (extraído del HTML): ver logs completos`)
      return
    }

    try {
      const result = await this.resend.emails.send({
        from: this.from,
        to,
        subject,
        html,
      })
      this.logger.log(`Email enviado: to=${to} id=${result.data?.id}`)
    } catch (err) {
      this.logger.error(`Error enviando email a ${to}: ${String(err)}`)
      // No relanzar — el error de email no debe interrumpir el flujo del usuario
      // (especialmente en forgot-password, que es fire-and-forget)
    }
  }
}
