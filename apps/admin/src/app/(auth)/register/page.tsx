'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Alert } from '@edithpress/ui'
import { useRegister } from '@/hooks/useRegister'

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'El nombre es obligatorio').max(50),
    lastName: z.string().min(1, 'El apellido es obligatorio').max(50),
    email: z.string().min(1, 'El email es obligatorio').email('Ingresa un email válido'),
    tenantName: z.string().min(2, 'El nombre del negocio debe tener al menos 2 caracteres').max(100),
    tenantSlug: z
      .string()
      .min(2, 'El subdominio debe tener al menos 2 caracteres')
      .max(50)
      .regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .slice(0, 50)
}

export default function RegisterPage() {
  const { register: doRegister, isLoading, error } = useRegister()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '', lastName: '', email: '',
      tenantName: '', tenantSlug: '', password: '', confirmPassword: '',
    },
  })

  const tenantSlug = watch('tenantSlug')

  function handleTenantNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue('tenantName', e.target.value)
    setValue('tenantSlug', slugify(e.target.value))
  }

  const onSubmit = (values: RegisterFormValues) => doRegister(values)

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 lg:hidden">
          <span className="text-xl font-bold text-white">E</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Crea tu cuenta gratis</h1>
        <p className="mt-1 text-sm text-gray-500">Sin tarjeta de crédito · Empieza en 2 minutos</p>
      </div>

      {error && <Alert variant="error" className="mb-6">{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Nombre"
            placeholder="Juan"
            autoComplete="given-name"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Apellido"
            placeholder="García"
            autoComplete="family-name"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

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
            label="Nombre de tu negocio"
            placeholder="Mi Empresa"
            error={errors.tenantName?.message}
            {...register('tenantName', { onChange: handleTenantNameChange })}
          />
          {tenantSlug && (
            <p className="text-xs text-gray-500">
              Tu sitio estará en:{' '}
              <span className="font-medium text-primary-600">
                {tenantSlug}.edithpress.com
              </span>
            </p>
          )}
          {errors.tenantSlug && (
            <p className="text-xs text-red-600">{errors.tenantSlug.message}</p>
          )}
        </div>

        <Input
          label="Contraseña"
          type="password"
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirmar contraseña"
          type="password"
          placeholder="Repite tu contraseña"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" size="lg" loading={isLoading} className="w-full mt-2">
          Crear cuenta gratis
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-medium text-primary-600 underline-offset-4 hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  )
}
