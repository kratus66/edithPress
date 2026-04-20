'use client'

import Link from 'next/link'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Alert } from '@edithpress/ui'
import { api, getApiErrorMessage } from '@/lib/api-client'

// ── Schema ──────────────────────────────────────────────────────────────────

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

// ── Inner component (needs useSearchParams — must be inside Suspense) ────────

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [apiError, setApiError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  if (!token) {
    return (
      <Alert variant="error">
        El enlace de restablecimiento es inválido o ha expirado.{' '}
        <Link href="/forgot-password" className="underline">
          Solicitar uno nuevo
        </Link>
        .
      </Alert>
    )
  }

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    setApiError(null)
    try {
      await api.post('/auth/reset-password', { token, password: values.password })
      router.push('/login?reset=true')
    } catch (err) {
      setApiError(getApiErrorMessage(err, 'El enlace es inválido o ha expirado. Solicita uno nuevo.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {apiError && (
        <Alert variant="error" onDismiss={() => setApiError(null)}>
          {apiError}
        </Alert>
      )}

      <Input
        label="Nueva contraseña"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />

      <Input
        label="Confirmar contraseña"
        type="password"
        placeholder="••••••••"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Button
        type="submit"
        size="lg"
        loading={isLoading}
        className="w-full"
      >
        Restablecer contraseña
      </Button>
    </form>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-sm">
      {/* Cabecera */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 lg:hidden">
          <span className="text-xl font-bold text-white">E</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Nueva contraseña</h1>
        <p className="mt-1 text-sm text-gray-500">
          Elige una contraseña segura de al menos 8 caracteres.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>

      <p className="mt-6 text-center text-sm text-gray-500">
        <Link
          href="/login"
          className="font-medium text-primary-600 underline-offset-4 hover:underline"
        >
          Volver al inicio de sesión
        </Link>
      </p>
    </div>
  )
}
