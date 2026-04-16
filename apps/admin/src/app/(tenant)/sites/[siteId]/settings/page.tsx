'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Alert, Card } from '@edithpress/ui'
import { api, getApiErrorMessage } from '@/lib/api-client'

// ── Schema ────────────────────────────────────────────────────────────────────

const settingsSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
  description: z.string().max(300, 'Máximo 300 caracteres').optional(),
  faviconUrl: z
    .string()
    .url('Ingresa una URL válida')
    .optional()
    .or(z.literal('')),
  seoTitle: z
    .string()
    .max(70, 'El título SEO debe tener menos de 70 caracteres')
    .optional(),
  seoDescription: z
    .string()
    .max(160, 'La descripción SEO debe tener menos de 160 caracteres')
    .optional(),
  seoImage: z
    .string()
    .url('Ingresa una URL válida para la imagen OG')
    .optional()
    .or(z.literal('')),
})

type SettingsValues = z.infer<typeof settingsSchema>

// ── Character counter ─────────────────────────────────────────────────────────

function CharCount({ value = '', max }: { value?: string; max: number }) {
  const remaining = max - (value?.length ?? 0)
  return (
    <span className={`text-xs ${remaining < 10 ? 'text-orange-500' : 'text-gray-400'}`}>
      {remaining} caracteres restantes
    </span>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SiteSettingsPage({
  params,
}: {
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = use(params)

  const [success, setSuccess] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: '',
      description: '',
      faviconUrl: '',
      seoTitle: '',
      seoDescription: '',
      seoImage: '',
    },
  })

  const watchedDesc = watch('description')
  const watchedSeoTitle = watch('seoTitle')
  const watchedSeoDesc = watch('seoDescription')

  // Load existing settings
  useEffect(() => {
    api
      .get<{
        data: {
          name: string
          description?: string
          settings?: {
            faviconUrl?: string
            seoTitle?: string
            seoDescription?: string
            seoImage?: string
          }
        }
      }>(`/sites/${siteId}`)
      .then(({ data }) => {
        reset({
          name: data.data.name,
          description: data.data.description ?? '',
          faviconUrl: data.data.settings?.faviconUrl ?? '',
          seoTitle: data.data.settings?.seoTitle ?? '',
          seoDescription: data.data.settings?.seoDescription ?? '',
          seoImage: data.data.settings?.seoImage ?? '',
        })
      })
      .catch(() => {})
  }, [siteId, reset])

  async function onSubmit(values: SettingsValues) {
    setApiError(null)
    setSuccess(false)
    try {
      await api.patch(`/sites/${siteId}`, {
        name: values.name,
        description: values.description,
        settings: {
          faviconUrl: values.faviconUrl || null,
          seoTitle: values.seoTitle || null,
          seoDescription: values.seoDescription || null,
          seoImage: values.seoImage || null,
        },
      })
      setSuccess(true)
    } catch (err) {
      setApiError(getApiErrorMessage(err, 'No se pudo guardar la configuración.'))
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/sites/${siteId}`}>
          <button
            type="button"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-md"
            aria-label="Volver al sitio"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Sitio
          </button>
        </Link>
        <h2 className="flex-1 text-xl font-semibold text-gray-900">Configuración del sitio</h2>
      </div>

      {success && (
        <Alert variant="success" onDismiss={() => setSuccess(false)}>
          Configuración guardada correctamente.
        </Alert>
      )}
      {apiError && (
        <Alert variant="error" onDismiss={() => setApiError(null)}>
          {apiError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* General */}
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-semibold text-gray-900">General</h3>

          <Input
            label="Nombre del sitio"
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="space-y-1">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              id="description"
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent resize-none"
              placeholder="Breve descripción de tu sitio..."
              {...register('description')}
            />
            <div className="flex justify-between">
              {errors.description ? (
                <p className="text-xs text-red-600">{errors.description.message}</p>
              ) : (
                <span />
              )}
              <CharCount value={watchedDesc} max={300} />
            </div>
          </div>

          <Input
            label="URL del favicon"
            type="url"
            placeholder="https://ejemplo.com/favicon.ico"
            error={errors.faviconUrl?.message}
            {...register('faviconUrl')}
          />
        </Card>

        {/* SEO */}
        <Card className="p-6 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">SEO global</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Estos valores se usan en las páginas que no tienen SEO propio configurado.
            </p>
          </div>

          <div className="space-y-1">
            <Input
              label="Título (og:title)"
              placeholder="Mi empresa — Sitio oficial"
              error={errors.seoTitle?.message}
              {...register('seoTitle')}
            />
            <CharCount value={watchedSeoTitle} max={70} />
          </div>

          <div className="space-y-1">
            <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700">
              Descripción (og:description / meta description)
            </label>
            <textarea
              id="seoDescription"
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent resize-none"
              placeholder="Descripción breve para buscadores y redes sociales..."
              {...register('seoDescription')}
            />
            <div className="flex justify-between">
              {errors.seoDescription ? (
                <p className="text-xs text-red-600">{errors.seoDescription.message}</p>
              ) : (
                <span />
              )}
              <CharCount value={watchedSeoDesc} max={160} />
            </div>
          </div>

          <Input
            label="Imagen OG (og:image)"
            type="url"
            placeholder="https://ejemplo.com/og-image.jpg"
            error={errors.seoImage?.message}
            {...register('seoImage')}
          />
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={!isDirty}
          >
            Guardar configuración
          </Button>
        </div>
      </form>
    </div>
  )
}
