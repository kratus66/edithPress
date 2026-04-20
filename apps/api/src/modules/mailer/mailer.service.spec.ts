import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { MailerService } from './mailer.service'

// ─── Resend mock ───────────────────────────────────────────────────────────────
//
// Mockeamos el SDK de Resend antes de que el módulo lo importe.
// La variable mockSend es accesible por hoisting de jest.mock().
//
const mockEmailsSend = jest.fn()

jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: { send: mockEmailsSend },
    })),
  }
})

// ─────────────────────────────────────────────────────────────────────────────

describe('MailerService', () => {
  let service: MailerService

  // ─── Config factory ──────────────────────────────────────────────────────────

  function buildModule(apiKey: string | undefined) {
    const mockConfig = {
      get: jest.fn().mockImplementation((key: string) => {
        const values: Record<string, string | undefined> = {
          RESEND_API_KEY: apiKey,
          RESEND_FROM_EMAIL: 'EdithPress <noreply@edithpress.com>',
          APP_URL: 'http://localhost:3000',
        }
        return values[key]
      }),
    }
    return Test.createTestingModule({
      providers: [
        MailerService,
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile()
  }

  // ─────────────────────────────────────── CON Resend configurado ──

  describe('when RESEND_API_KEY is configured', () => {
    beforeEach(async () => {
      jest.clearAllMocks()
      const module: TestingModule = await buildModule('re_test_key_abc123')
      service = module.get<MailerService>(MailerService)
    })

    // ── sendVerificationEmail ─────────────────────────────────────

    describe('sendVerificationEmail()', () => {
      it('should call Resend with correct to, subject and html containing the verify link', async () => {
        // Arrange
        mockEmailsSend.mockResolvedValueOnce({ data: { id: 'email-001' }, error: null })

        // Act
        await service.sendVerificationEmail('user@example.com', 'jwt-token-abc')

        // Assert
        expect(mockEmailsSend).toHaveBeenCalledTimes(1)
        const callArgs = mockEmailsSend.mock.calls[0][0]
        expect(callArgs.to).toBe('user@example.com')
        expect(callArgs.subject).toContain('Verifica')
        expect(callArgs.html).toContain('jwt-token-abc')
        expect(callArgs.html).toContain('/auth/verify-email?token=')
      })

      it('should not throw when Resend provider fails — just log the error', async () => {
        // Arrange — Resend lanza una excepción de red
        mockEmailsSend.mockRejectedValueOnce(new Error('Resend network timeout'))

        // Act & Assert — no debe propagar el error
        await expect(
          service.sendVerificationEmail('user@example.com', 'some-token'),
        ).resolves.toBeUndefined()
      })
    })

    // ── sendPasswordResetEmail ────────────────────────────────────

    describe('sendPasswordResetEmail()', () => {
      it('should call Resend with correct to and subject', async () => {
        // Arrange
        mockEmailsSend.mockResolvedValueOnce({ data: { id: 'email-002' }, error: null })
        const resetToken = 'a'.repeat(64) // token opaco de 64 chars

        // Act
        await service.sendPasswordResetEmail('reset@example.com', resetToken)

        // Assert
        expect(mockEmailsSend).toHaveBeenCalledTimes(1)
        const callArgs = mockEmailsSend.mock.calls[0][0]
        expect(callArgs.to).toBe('reset@example.com')
        expect(callArgs.subject).toContain('contraseña')
      })

      it('should include the reset token in the email body link', async () => {
        // Arrange
        mockEmailsSend.mockResolvedValueOnce({ data: { id: 'email-003' }, error: null })
        const token = 'deadbeef1234567890abcdef'

        // Act
        await service.sendPasswordResetEmail('user@test.com', token)

        // Assert — el token debe estar en el cuerpo del email
        const callArgs = mockEmailsSend.mock.calls[0][0]
        expect(callArgs.html).toContain(token)
        expect(callArgs.html).toContain('/reset-password?token=')
      })

      it('should not throw when Resend provider fails — just log the error', async () => {
        // Arrange
        mockEmailsSend.mockRejectedValueOnce(new Error('SMTP error 550'))

        // Act & Assert — fire-and-forget, no propagar el error
        await expect(
          service.sendPasswordResetEmail('user@test.com', 'token-xyz'),
        ).resolves.toBeUndefined()
      })
    })

    // ── sendContactFormEmail ──────────────────────────────────────

    describe('sendContactFormEmail()', () => {
      it('should send email to the site owner with sender name and message', async () => {
        // Arrange
        mockEmailsSend.mockResolvedValueOnce({ data: { id: 'email-004' }, error: null })

        // Act
        await service.sendContactFormEmail({
          siteOwnerEmail: 'owner@mysite.com',
          fromName: 'John Doe',
          fromEmail: 'john@example.com',
          message: 'Hello from your contact form!',
        })

        // Assert
        const callArgs = mockEmailsSend.mock.calls[0][0]
        expect(callArgs.to).toBe('owner@mysite.com')
        expect(callArgs.html).toContain('John Doe')
        expect(callArgs.html).toContain('john@example.com')
        expect(callArgs.html).toContain('Hello from your contact form!')
      })

      it('should sanitize XSS characters in message before sending', async () => {
        // Arrange
        mockEmailsSend.mockResolvedValueOnce({ data: { id: 'email-005' }, error: null })

        // Act
        await service.sendContactFormEmail({
          siteOwnerEmail: 'owner@mysite.com',
          fromName: 'Attacker',
          fromEmail: 'bad@example.com',
          message: '<script>alert("xss")</script>',
        })

        // Assert — el HTML del email no debe contener tags sin escapar
        const callArgs = mockEmailsSend.mock.calls[0][0]
        expect(callArgs.html).not.toContain('<script>')
        expect(callArgs.html).toContain('&lt;script&gt;')
      })

      it('should not throw when Resend fails for contact form', async () => {
        // Arrange
        mockEmailsSend.mockRejectedValueOnce(new Error('Rate limit exceeded'))

        // Act & Assert
        await expect(
          service.sendContactFormEmail({
            siteOwnerEmail: 'owner@mysite.com',
            fromName: 'User',
            fromEmail: 'u@example.com',
            message: 'Hello',
          }),
        ).resolves.toBeUndefined()
      })
    })
  })

  // ─────────────────────────────────────── SIN Resend (modo dev) ──

  describe('when RESEND_API_KEY is not configured (dev mode)', () => {
    beforeEach(async () => {
      jest.clearAllMocks()
      const module: TestingModule = await buildModule(undefined)
      service = module.get<MailerService>(MailerService)
    })

    it('should not call Resend when sendVerificationEmail is invoked in dev mode', async () => {
      // Act
      await service.sendVerificationEmail('dev@example.com', 'dev-token')

      // Assert — Resend no fue llamado
      expect(mockEmailsSend).not.toHaveBeenCalled()
    })

    it('should not call Resend when sendPasswordResetEmail is invoked in dev mode', async () => {
      // Act
      await service.sendPasswordResetEmail('dev@example.com', 'dev-reset-token')

      // Assert
      expect(mockEmailsSend).not.toHaveBeenCalled()
    })

    it('should resolve without error in dev mode for all methods', async () => {
      // Act & Assert — todos los métodos deben completar sin error
      await expect(
        service.sendVerificationEmail('a@b.com', 'tok'),
      ).resolves.toBeUndefined()
      await expect(
        service.sendPasswordResetEmail('a@b.com', 'tok'),
      ).resolves.toBeUndefined()
      await expect(
        service.sendContactFormEmail({
          siteOwnerEmail: 'o@b.com',
          fromName: 'X',
          fromEmail: 'x@b.com',
          message: 'hi',
        }),
      ).resolves.toBeUndefined()
    })
  })
})
