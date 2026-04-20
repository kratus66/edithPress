'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Alert, Card, StepIndicator, TemplateCard } from '@edithpress/ui'
import { api, getApiErrorMessage } from '@/lib/api-client'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Template {
  id: string
  name: string
  description?: string
  category: string
  previewImageUrl?: string
  isPremium?: boolean
  usageCount?: number
}

// ── Schema paso 2 ─────────────────────────────────────────────────────────────

const siteSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'Máximo 100 caracteres'),
  slug: z
    .string()
    .min(2, 'El subdominio debe tener al menos 2 caracteres')
    .max(63, 'Máximo 63 caracteres')
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/,
      'Solo letras minúsculas, números y guiones. No puede empezar ni terminar con guión.'
    ),
})

type SiteFormValues = z.infer<typeof siteSchema>

// ── Categorías ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'all', label: 'Todos' },
  { value: 'landing', label: 'Landing' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'business', label: 'Negocio' },
  { value: 'restaurant', label: 'Restaurante' },
  { value: 'education', label: 'Educación' },
  { value: 'basic', label: 'Básico' },
]

// Template "página en blanco" que siempre aparece primero
const BLANK_TEMPLATE: Template = {
  id: 'tpl-blank',
  name: 'Página en blanco',
  description: 'Empieza desde cero con total libertad',
  category: 'basic',
}

// Mock de templates — TODO: conectar a API real GET /api/v1/templates?limit=12
const MOCK_TEMPLATES: Template[] = [
  { id: 'tpl-portfolio-01', name: 'Portfolio Creativo', description: 'Perfecto para fotógrafos y diseñadores', category: 'portfolio' },
  { id: 'tpl-restaurant-01', name: 'Restaurante Moderno', description: 'Menú, galería y reservas online', category: 'restaurant' },
  { id: 'tpl-landing-01', name: 'Landing de Producto', description: 'Convierte visitantes en clientes', category: 'landing', isPremium: true },
  { id: 'tpl-business-01', name: 'Empresa Corporativa', description: 'Profesional y confiable', category: 'business' },
  { id: 'tpl-education-01', name: 'Academia Online', description: 'Cursos y programas educativos', category: 'education', isPremium: true },
  { id: 'tpl-landing-02', name: 'Startup SaaS', description: 'Ideal para productos digitales', category: 'landing' },
  { id: 'tpl-portfolio-02', name: 'CV Interactivo', description: 'Destaca tu experiencia profesional', category: 'portfolio' },
  { id: 'tpl-business-02', name: 'Servicios Locales', description: 'Fontanería, electricidad, reformas...', category: 'business' },
  { id: 'tpl-restaurant-02', name: 'Cafetería & Brunch', description: 'Ambiente acogedor y minimalista', category: 'restaurant' },
]

// ── Paso 1 — Selector de template ────────────────────────────────────────────

function TemplateSelector({
  selectedId,
  onSelect,
  onContinue,
}: {
  selectedId: string | null
  onSelect: (id: string) => void
  onContinue: () => void
}) {
  const [activeCategory, setActiveCategory] = useState('all')

  // TODO: conectar a API real cuando esté disponible
  const { data: templates, isLoading } = useQuery<Template[]>({
    queryKey: ['templates', { limit: 12 }],
    queryFn: async () => {
      const { data } = await api.get<{ data: Template[] }>('/templates?limit=12')
      return data.data
    },
    // Si la API no está disponible, usar mocks
    placeholderData: MOCK_TEMPLATES,
    retry: false,
  })

  const allTemplates = [BLANK_TEMPLATE, ...(templates ?? MOCK_TEMPLATES)]

  const filtered =
    activeCategory === 'all'
      ? allTemplates
      : allTemplates.filter((t) => t.category === activeCategory)

  return (
    <div className="space-y-6">
      {/* Filtros por categoría */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por categoría">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            type="button"
            role="tab"
            aria-selected={activeCategory === cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${
              activeCategory === cat.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid de templates */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-video rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tpl) => (
            <TemplateCard
              key={tpl.id}
              id={tpl.id}
              name={tpl.name}
              description={tpl.description}
              category={tpl.category}
              previewImageUrl={tpl.previewImageUrl}
              isPremium={tpl.isPremium}
              usageCount={tpl.usageCount}
              isSelected={selectedId === tpl.id}
              onClick={onSelect}
            />
          ))}
        </div>
      )}

      {/* Acciones */}
      <div className="flex gap-3 justify-end border-t border-gray-100 pt-4">
        <Link href="/sites">
          <Button variant="outline" type="button">Cancelar</Button>
        </Link>
        <Button
          type="button"
          onClick={onContinue}
          disabled={!selectedId}
        >
          Continuar &rarr;
        </Button>
      </div>
    </div>
  )
}

// ── Paso 2 — Formulario de datos del sitio ────────────────────────────────────

function SiteDataForm({
  templateId,
  onBack,
}: {
  templateId: string
  onBack: () => void
}) {
  const router = useRouter()
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SiteFormValues>({
    resolver: zodResolver(siteSchema),
    defaultValues: { name: '', slug: '' },
  })

  const watchedName = watch('name')
  const watchedSlug = watch('slug')

  // Auto-generar slug desde el nombre
  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value
    const autoSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 63)
    setValue('slug', autoSlug, { shouldValidate: watchedSlug !== '' })
  }

  async function onSubmit(values: SiteFormValues) {
    setApiError(null)
    try {
      const { data } = await api.post<{ data: { id: string } }>('/sites', {
        name: values.name,
        slug: values.slug,
        templateId: templateId !== 'tpl-blank' ? templateId : undefined,
      })
      router.push(`/builder/${data.data.id}`)
    } catch (err) {
      setApiError(getApiErrorMessage(err, 'No se pudo crear el sitio.'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {apiError && <Alert variant="error" onDismiss={() => setApiError(null)}>{apiError}</Alert>}

      <Card className="p-6 space-y-5">
        <h3 className="text-base font-semibold text-gray-900">Datos del sitio</h3>

        <Input
          label="Nombre del sitio"
          placeholder="Mi Empresa"
          error={errors.name?.message}
          autoFocus
          {...register('name', { onChange: handleNameChange })}
        />

        <div className="space-y-1">
          <Input
            label="Subdominio"
            placeholder="mi-empresa"
            error={errors.slug?.message}
            {...register('slug')}
          />
          {watchedSlug && !errors.slug && (
            <p className="text-xs text-gray-500">
              Tu sitio:{' '}
              <span className="font-medium text-primary-600">
                {watchedSlug}.edithpress.com
              </span>
            </p>
          )}
        </div>
      </Card>

      <div className="flex gap-3 justify-between border-t border-gray-100 pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          &larr; Volver
        </Button>
        <div className="flex gap-3">
          <Link href="/sites">
            <Button variant="ghost" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" loading={isSubmitting}>
            Crear sitio
          </Button>
        </div>
      </div>
    </form>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NewSitePage() {
  const [step, setStep] = useState<0 | 1>(0)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

  const STEPS = ['Elegir template', 'Datos del sitio']

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/sites">
          <button
            type="button"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-md"
            aria-label="Volver a sitios"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Volver
          </button>
        </Link>
        <h2 className="text-xl font-semibold text-gray-900">Nuevo sitio</h2>
      </div>

      {/* Step indicator */}
      <StepIndicator steps={STEPS} currentStep={step} />

      {/* Contenido por paso */}
      {step === 0 ? (
        <TemplateSelector
          selectedId={selectedTemplateId}
          onSelect={setSelectedTemplateId}
          onContinue={() => setStep(1)}
        />
      ) : (
        <SiteDataForm
          templateId={selectedTemplateId ?? 'tpl-blank'}
          onBack={() => setStep(0)}
        />
      )}
    </div>
  )
}
