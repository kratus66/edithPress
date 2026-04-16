'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Alert } from '@edithpress/ui'
import { useLogin } from '@/hooks/useLogin'

// ── Schema de validación ────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('Ingresa un email con formato válido (ej: usuario@dominio.com)'),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria')
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

type LoginFormValues = z.infer<typeof loginSchema>

// ── Componente ──────────────────────────────────────────────────────────────

export default function LoginPage() {
  const { login, isLoading, error } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = (values: LoginFormValues) => login(values)

  return (
    <div className="w-full max-w-sm">
      {/* Cabecera */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 lg:hidden">
          <span className="text-xl font-bold text-white">E</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-gray-500">Accede a tu panel de EdithPress</p>
      </div>

      {/* Error global de la API */}
      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <Input
          label="Email"
          type="email"
          placeholder="tu@email.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="space-y-1">
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-primary-600 underline-offset-4 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          loading={isLoading}
          className="w-full"
        >
          Entrar
        </Button>
      </form>

      {/* Pie — registro */}
      <p className="mt-6 text-center text-sm text-gray-500">
        ¿No tienes cuenta?{' '}
        <Link
          href="/register"
          className="font-medium text-primary-600 underline-offset-4 hover:underline"
        >
          Crear cuenta gratis
        </Link>
      </p>
    </div>
  )
}
