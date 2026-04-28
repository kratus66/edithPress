'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Alert, Card } from '@edithpress/ui'
import { api, getApiErrorMessage } from '@/lib/api-client'

// ── Schemas ───────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  firstName: z.string().min(1, 'El nombre es obligatorio').max(50),
  lastName: z.string().min(1, 'El apellido es obligatorio').max(50),
  email: z.string().email('Ingresa un email válido'),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Ingresa tu contraseña actual'),
    newPassword: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirma tu nueva contraseña'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type ProfileValues = z.infer<typeof profileSchema>
type PasswordValues = z.infer<typeof passwordSchema>

// ── Profile form ──────────────────────────────────────────────────────────────

function ProfileForm() {
  const [success, setSuccess] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    api.get<{ data: { firstName: string; lastName: string; email: string } }>('/users/me')
      .then(({ data }) => reset(data.data))
      .catch(() => {})
  }, [reset])

  async function onSubmit(values: ProfileValues) {
    setApiError(null)
    setSuccess(false)
    try {
      await api.patch('/users/me', values)
      setSuccess(true)
    } catch (err) {
      setApiError(getApiErrorMessage(err, 'No se pudieron guardar los cambios.'))
    }
  }

  return (
    <Card className="p-6 space-y-5">
      <h3 className="text-base font-semibold text-gray-900">Perfil</h3>

      {success && <Alert variant="success">Cambios guardados correctamente.</Alert>}
      {apiError && <Alert variant="error">{apiError}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nombre" error={errors.firstName?.message} {...register('firstName')} />
          <Input label="Apellido" error={errors.lastName?.message} {...register('lastName')} />
        </div>
        <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting}>Guardar cambios</Button>
        </div>
      </form>
    </Card>
  )
}

// ── Password form ─────────────────────────────────────────────────────────────

function PasswordForm() {
  const [success, setSuccess] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
  })

  async function onSubmit(values: PasswordValues) {
    setApiError(null)
    setSuccess(false)
    try {
      await api.patch('/users/me/password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      setSuccess(true)
      reset()
    } catch (err) {
      setApiError(getApiErrorMessage(err, 'No se pudo cambiar la contraseña.'))
    }
  }

  return (
    <Card className="p-6 space-y-5">
      <h3 className="text-base font-semibold text-gray-900">Cambiar contraseña</h3>

      {success && <Alert variant="success">Contraseña actualizada correctamente.</Alert>}
      {apiError && <Alert variant="error">{apiError}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Contraseña actual" type="password" autoComplete="current-password" error={errors.currentPassword?.message} {...register('currentPassword')} />
        <Input label="Nueva contraseña" type="password" autoComplete="new-password" error={errors.newPassword?.message} {...register('newPassword')} />
        <Input label="Confirmar contraseña" type="password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting}>Actualizar contraseña</Button>
        </div>
      </form>
    </Card>
  )
}

// ── Danger zone ───────────────────────────────────────────────────────────────

function DangerZone() {
  const [confirm, setConfirm] = useState(false)

  return (
    <Card className="p-6 border-red-200">
      <h3 className="text-base font-semibold text-red-700 mb-2">Zona de peligro</h3>
      <p className="text-sm text-gray-500 mb-4">
        Eliminar tu cuenta es una acción permanente. Todos tus sitios, páginas y datos serán borrados.
      </p>
      {!confirm ? (
        <Button variant="destructive" onClick={() => setConfirm(true)}>
          Eliminar mi cuenta
        </Button>
      ) : (
        <div className="flex items-center gap-3">
          <p className="text-sm text-error font-medium">¿Estás seguro? Esta acción no se puede deshacer.</p>
          <Button variant="destructive" onClick={() => api.delete('/users/me').then(() => { window.location.href = '/login' })}>
            Sí, eliminar
          </Button>
          <Button variant="outline" onClick={() => setConfirm(false)}>Cancelar</Button>
        </div>
      )}
    </Card>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Configuración</h2>
      <ProfileForm />
      <PasswordForm />
      <DangerZone />
    </div>
  )
}
