'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Alert } from '@edithpress/ui'
import { api, getApiErrorMessage } from '@/lib/api-client'

// ── Schema ──────────────────────────────────────────────────────────────────

const schema = z.object({
  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('Ingresa un email con formato válido'),
})

type FormValues = z.infer<typeof schema>

// ── Component ────────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    try {
      await api.post('/auth/forgot-password', { email: values.email })
    } catch (err) {
      // SEC: intentionally ignore errors — never reveal whether the email exists
      // (user enumeration prevention). Always show the success message.
      void getApiErrorMessage(err)
    } finally {
      setIsLoading(false)
      setSubmitted(true)
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Cabecera */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 lg:hidden">
          <span className="text-xl font-bold text-white">E</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Recuperar contraseña</h1>
        <p className="mt-1 text-sm text-gray-500">
          Te enviaremos un enlace para restablecer tu contraseña.
        </p>
      </div>

      {submitted ? (
        <div className="space-y-4">
          <Alert variant="success">
            Si existe una cuenta con ese email, recibirás un enlace en los próximos minutos.
            Revisa también tu carpeta de spam.
          </Alert>
          <p className="text-center text-sm text-gray-500">
            <Link
              href="/login"
              className="font-medium text-primary-600 underline-offset-4 hover:underline"
            >
              Volver al inicio de sesión
            </Link>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <Button
            type="submit"
            size="lg"
            loading={isLoading}
            className="w-full"
          >
            Enviar enlace
          </Button>

          <p className="text-center text-sm text-gray-500">
            <Link
              href="/login"
              className="font-medium text-primary-600 underline-offset-4 hover:underline"
            >
              Volver al inicio de sesión
            </Link>
          </p>
        </form>
      )}
    </div>
  )
}
