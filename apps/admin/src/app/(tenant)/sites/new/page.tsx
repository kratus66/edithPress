'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Alert, Card } from '@edithpress/ui'
import { api, getApiErrorMessage } from '@/lib/api-client'

const schema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  description: z.string().max(500).optional(),
})

type FormValues = z.infer<typeof schema>

// Templates placeholder — en FASE 1 se cargan desde /templates
const STARTER_TEMPLATES = [
  { id: 'blank',       name: 'En blanco',    emoji: '⬜', desc: 'Empieza desde cero' },
  { id: 'portfolio',   name: 'Portafolio',   emoji: '🎨', desc: 'Perfecto para creativos' },
  { id: 'restaurant',  name: 'Restaurante',  emoji: '🍽️', desc: 'Menú y reservas' },
  { id: 'services',    name: 'Servicios',    emoji: '💼', desc: 'Consultores y coaches' },
]

export default function NewSitePage() {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState('blank')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '' },
  })

  async function onSubmit(values: FormValues) {
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await api.post<{ data: { id: string } }>('/sites', {
        name: values.name,
        description: values.description || undefined,
        templateId: selectedTemplate !== 'blank' ? selectedTemplate : undefined,
      })
      router.push(`/sites/${data.data.id}`)
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo crear el sitio.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/sites">
          <button type="button" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-md" aria-label="Volver a sitios">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Volver
          </button>
        </Link>
        <h2 className="text-xl font-semibold text-gray-900">Nuevo sitio</h2>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Datos del sitio */}
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-semibold text-gray-900">Información del sitio</h3>
          <Input
            label="Nombre del sitio"
            placeholder="Mi Empresa"
            error={errors.name?.message}
            autoFocus
            {...register('name')}
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700" htmlFor="description">
              Descripción <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Breve descripción de tu sitio..."
              className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent resize-none"
              {...register('description')}
            />
          </div>
        </Card>

        {/* Template */}
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-semibold text-gray-900">Elige un template</h3>
          <div className="grid grid-cols-2 gap-3">
            {STARTER_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setSelectedTemplate(tpl.id)}
                className={`flex flex-col items-start gap-1 rounded-lg border-2 p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${
                  selectedTemplate === tpl.id
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-primary-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl">{tpl.emoji}</span>
                <span className="text-sm font-semibold text-gray-900">{tpl.name}</span>
                <span className="text-xs text-gray-500">{tpl.desc}</span>
              </button>
            ))}
          </div>
          <Link href="/templates" className="text-sm text-primary-600 hover:underline underline-offset-4">
            Ver todos los templates →
          </Link>
        </Card>

        <div className="flex gap-3 justify-end">
          <Link href="/sites">
            <Button variant="outline" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" loading={isLoading}>
            Crear sitio
          </Button>
        </div>
      </form>
    </div>
  )
}
