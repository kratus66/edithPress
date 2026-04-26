'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const BUILDER_BASE = process.env.NEXT_PUBLIC_BUILDER_URL ?? 'http://localhost:3002'
function builderHref(siteId: string, pageId: string): string {
  const base = `${BUILDER_BASE}/builder/${siteId}/${pageId}`
  if (typeof document === 'undefined') return base
  const token = document.cookie.match(/(?:^|;\s*)access_token=([^;]+)/)?.[1]
  return token ? `${base}?token=${token}` : base
}
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Alert, Card } from '@edithpress/ui'
import { api, getApiErrorMessage } from '@/lib/api-client'

const pageSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio').max(200, 'Máximo 200 caracteres'),
  slug: z
    .string()
    .min(1, 'El slug es obligatorio')
    .max(200, 'Máximo 200 caracteres')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Solo letras minúsculas, números y guiones'),
  isHomepage: z.boolean().optional(),
})

type PageFormValues = z.infer<typeof pageSchema>

export default function NewPagePage({ params }: { params: { siteId: string } }) {
  const { siteId } = params
  const router = useRouter()
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PageFormValues>({
    resolver: zodResolver(pageSchema),
    defaultValues: { title: '', slug: '', isHomepage: false },
  })

  const watchedSlug = watch('slug')

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const title = e.target.value
    const autoSlug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 200)
    setValue('slug', autoSlug, { shouldValidate: watchedSlug !== '' })
  }

  async function onSubmit(values: PageFormValues) {
    setApiError(null)
    try {
      const { data } = await api.post<{ data: { id: string } }>(
        `/sites/${siteId}/pages`,
        values,
      )
      router.push(builderHref(siteId, data.data.id))
    } catch (err) {
      setApiError(getApiErrorMessage(err, 'No se pudo crear la página.'))
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/sites/${siteId}/pages`}>
          <button
            type="button"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-md"
            aria-label="Volver a páginas"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Páginas
          </button>
        </Link>
        <h2 className="text-xl font-semibold text-gray-900">Nueva página</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {apiError && <Alert variant="error" onDismiss={() => setApiError(null)}>{apiError}</Alert>}

        <Card className="p-6 space-y-5">
          <Input
            label="Título de la página"
            placeholder="Sobre nosotros"
            error={errors.title?.message}
            autoFocus
            {...register('title', { onChange: handleTitleChange })}
          />

          <div className="space-y-1">
            <Input
              label="Slug (URL)"
              placeholder="sobre-nosotros"
              error={errors.slug?.message}
              {...register('slug')}
            />
            {watchedSlug && !errors.slug && (
              <p className="text-xs text-gray-500">
                URL:{' '}
                <span className="font-medium text-primary-600">/{watchedSlug}</span>
              </p>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              {...register('isHomepage')}
            />
            <span className="text-sm text-gray-700">Página de inicio</span>
          </label>
        </Card>

        <div className="flex justify-between border-t border-gray-100 pt-4">
          <Link href={`/sites/${siteId}/pages`}>
            <Button variant="outline" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" loading={isSubmitting}>
            Crear y abrir editor
          </Button>
        </div>
      </form>
    </div>
  )
}
