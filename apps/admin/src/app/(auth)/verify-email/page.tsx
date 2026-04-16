'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button, Alert } from '@edithpress/ui'
import { api, getApiErrorMessage } from '@/lib/api-client'

export default function VerifyEmailPage() {
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleResend() {
    setResending(true)
    setError(null)
    try {
      await api.post('/auth/resend-verification')
      setResent(true)
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo reenviar el email. Inténtalo de nuevo.'))
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="w-full max-w-sm text-center">
      {/* Icono */}
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600" aria-hidden="true">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-gray-900">Revisa tu email</h1>
      <p className="mt-3 text-sm text-gray-500 leading-relaxed">
        Te enviamos un enlace de verificación a tu correo. Haz clic en el enlace para activar tu cuenta.
      </p>
      <p className="mt-1 text-xs text-gray-400">
        Si no lo ves, revisa la carpeta de spam.
      </p>

      <div className="mt-8 space-y-3">
        {resent && (
          <Alert variant="success">
            Email reenviado. Revisa tu bandeja de entrada.
          </Alert>
        )}
        {error && <Alert variant="error">{error}</Alert>}

        <Button
          variant="outline"
          className="w-full"
          onClick={handleResend}
          loading={resending}
          disabled={resent}
        >
          {resent ? 'Email enviado ✓' : 'Reenviar email de verificación'}
        </Button>

        <Link href="/login" className="block text-sm text-gray-500 hover:text-gray-700 transition-colors">
          ← Volver al inicio de sesión
        </Link>
      </div>
    </div>
  )
}
