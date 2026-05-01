'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Alert } from '@edithpress/ui'
import { api, getApiErrorMessage } from '@/lib/api-client'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Template {
  id: string
  name: string
  description?: string | null
  thumbnailUrl?: string | null
  category: string
  isPremium: boolean
  tags: string[]
}

interface Page {
  id: string
  isHomepage: boolean
  slug: string
}

interface CreatedSite {
  id: string
  pages?: Page[]
}

// ── Tipos de sitio ─────────────────────────────────────────────────────────────

const SITE_TYPES = [
  { value: 'ecommerce',  label: 'Tienda / E-commerce', icon: '🛍️', desc: 'Catálogo de productos y ventas' },
  { value: 'portfolio',  label: 'Portfolio',           icon: '🎨', desc: 'Muestra tu trabajo creativo' },
  { value: 'restaurant', label: 'Restaurante',         icon: '🍽️', desc: 'Menú, reservas y contacto' },
  { value: 'services',   label: 'Agencia / Servicios', icon: '💼', desc: 'Consultoría, coaching, etc.' },
  { value: 'nonprofit',  label: 'ONG / Causa Social',  icon: '🌱', desc: 'Organizaciones sin fines de lucro' },
]

// ── Schemas ────────────────────────────────────────────────────────────────────

const step1Schema = z.object({
  businessName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
})

const step4Schema = z.object({
  siteName: z.string().min(2, 'El nombre del sitio debe tener al menos 2 caracteres').max(100),
  siteSlug: z
    .string()
    .min(3, 'El subdominio debe tener al menos 3 caracteres')
    .max(50, 'Máximo 50 caracteres')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Solo letras minúsculas, números y guiones (sin guión al inicio o final)'),
})

type Step1Values = z.infer<typeof step1Schema>
type Step4Values = z.infer<typeof step4Schema>

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 50)
}

// ── Step indicator ─────────────────────────────────────────────────────────────

const STEP_LABELS = ['Negocio', 'Tipo', 'Template', 'Nombre', 'Listo']

function StepIndicator({ current }: { current: number }) {
  const total = STEP_LABELS.length
  return (
    <div className="mb-8" role="list" aria-label="Pasos del asistente de configuración">
      <div className="flex items-center gap-1.5 mb-3">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < current ? 'bg-primary-600' : i === current ? 'bg-primary-300' : 'bg-gray-200'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
      <div className="flex items-start gap-1.5">
        {STEP_LABELS.map((label, i) => {
          const isDone = i < current
          const isCurrent = i === current
          return (
            <div
              key={i}
              role="listitem"
              aria-current={isCurrent ? 'step' : undefined}
              className="flex-1 text-center"
            >
              <span
                className={`text-xs font-medium transition-colors ${
                  isCurrent ? 'text-primary-600' : isDone ? 'text-gray-400' : 'text-gray-300'
                }`}
              >
                {isDone ? (
                  <span className="inline-flex items-center justify-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {label}
                  </span>
                ) : label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Template Card ──────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  selected,
  onSelect,
}: {
  template: Template
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`relative flex flex-col rounded-lg border-2 overflow-hidden text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${
        selected
          ? 'border-primary-600 shadow-md'
          : 'border-gray-200 hover:border-primary-300'
      }`}
    >
      {/* Thumbnail */}
      <div className="h-28 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center overflow-hidden">
        {template.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={template.thumbnailUrl}
            alt={`Preview de ${template.name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-3xl" aria-hidden="true">🌐</span>
        )}
      </div>

      {/* Check overlay */}
      {selected && (
        <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-white" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-semibold text-gray-900 truncate">{template.name}</p>
        {template.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{template.description}</p>
        )}
        {template.isPremium && (
          <span className="mt-1 inline-block text-xs font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Premium</span>
        )}
      </div>
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()

  // Guard: si ya tiene sitios, redirigir al dashboard
  const [checkingRedirect, setCheckingRedirect] = useState(true)

  const [step, setStep] = useState(1)
  const [data, setData] = useState({
    businessName: '',
    siteType: '',
    templateId: '',
    siteName: '',
    siteSlug: '',
  })

  // Step 3 — templates
  const [templates, setTemplates] = useState<Template[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [templatesError, setTemplatesError] = useState<string | null>(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState('')

  // Step 5 — creation result
  const [createdSite, setCreatedSite] = useState<CreatedSite | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // Forms
  const step1Form = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: { businessName: '' },
  })
  const step4Form = useForm<Step4Values>({
    resolver: zodResolver(step4Schema),
    defaultValues: { siteName: '', siteSlug: '' },
  })

  // ── Redirect guard ─────────────────────────────────────────────────────────
  useEffect(() => {
    api
      .get<{ data: unknown[] }>('/sites?limit=1')
      .then(({ data: res }) => {
        if (res.data.length > 0) {
          router.replace('/dashboard')
        } else {
          setCheckingRedirect(false)
        }
      })
      .catch(() => setCheckingRedirect(false))
  }, [router])

  // ── Step 3: fetch templates when entering ──────────────────────────────────
  useEffect(() => {
    if (step !== 3) return
    setTemplatesLoading(true)
    setTemplatesError(null)
    const params = data.siteType ? `?category=${data.siteType}` : ''
    api
      .get<{ data: Template[] }>(`/templates${params}`)
      .then(({ data: res }) => setTemplates(res.data))
      .catch((err) => setTemplatesError(getApiErrorMessage(err, 'No se pudieron cargar los templates.')))
      .finally(() => setTemplatesLoading(false))
  }, [step, data.siteType])

  // ── Step 5: create site on mount ───────────────────────────────────────────
  useEffect(() => {
    if (step !== 5) return
    setIsCreating(true)
    setCreateError(null)

    api
      .post<{ data: CreatedSite & { pages?: Page[] } }>('/sites', {
        name: data.siteName,
        description: `Sitio de ${data.businessName}`,
        ...(data.templateId ? { templateId: data.templateId } : {}),
      })
      .then(({ data: res }) => setCreatedSite(res.data))
      .catch((err) => setCreateError(getApiErrorMessage(err, 'No se pudo crear el sitio. Inténtalo de nuevo.')))
      .finally(() => setIsCreating(false))
  // retryCount is used to re-trigger this effect when user retries
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, retryCount])

  // ── Navigation ─────────────────────────────────────────────────────────────

  function handleStep1(values: Step1Values) {
    const slug = slugify(values.businessName)
    setData((d) => ({ ...d, businessName: values.businessName }))
    step4Form.setValue('siteName', values.businessName)
    step4Form.setValue('siteSlug', slug)
    setStep(2)
  }

  function handleStep2(siteType: string) {
    setData((d) => ({ ...d, siteType }))
    setStep(3)
  }

  function handleStep3() {
    setData((d) => ({ ...d, templateId: selectedTemplateId }))
    setStep(4)
  }

  function handleStep4(values: Step4Values) {
    setData((d) => ({ ...d, siteName: values.siteName, siteSlug: values.siteSlug }))
    setStep(5)
  }

  function handleGoToBuilder() {
    if (!createdSite) return
    const pages = createdSite.pages ?? []
    const homepage = pages.find((p) => p.isHomepage) ?? pages[0]
    if (homepage) {
      router.push(`/builder/${createdSite.id}/${homepage.id}`)
    } else {
      router.push(`/sites/${createdSite.id}`)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (checkingRedirect) {
    return (
      <div className="min-h-screen bg-bg-secondary flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" aria-label="Cargando..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-md p-8">
        <StepIndicator current={step - 1} />

        {/* ── Paso 1 — Nombre del negocio ─────────────────────────────────── */}
        {step === 1 && (
          <form onSubmit={step1Form.handleSubmit(handleStep1)} className="space-y-6">
            <div className="text-center">
              <p className="text-3xl mb-3" aria-hidden="true">👋</p>
              <h1 className="text-2xl font-bold text-gray-900">Bienvenido a EdithPress</h1>
              <p className="mt-2 text-sm text-gray-500">Vamos a crear tu primer sitio en menos de 2 minutos.</p>
            </div>
            <Input
              label="¿Cuál es el nombre de tu negocio?"
              placeholder="Mi Empresa"
              autoFocus
              error={step1Form.formState.errors.businessName?.message}
              {...step1Form.register('businessName')}
            />
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={!step1Form.watch('businessName')}
            >
              Siguiente
            </Button>
          </form>
        )}

        {/* ── Paso 2 — Tipo de sitio ────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-3xl mb-3" aria-hidden="true">🎯</p>
              <h2 className="text-2xl font-bold text-gray-900">¿Qué tipo de sitio necesitas?</h2>
              <p className="mt-2 text-sm text-gray-500">Te sugeriremos los mejores templates para ti.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SITE_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleStep2(type.value)}
                  className={`flex flex-col items-start gap-1 rounded-lg border-2 p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${
                    data.siteType === type.value
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  <span className="text-2xl" aria-hidden="true">{type.icon}</span>
                  <span className="text-sm font-semibold text-gray-900">{type.label}</span>
                  <span className="text-xs text-gray-500">{type.desc}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-md px-2 py-1"
            >
              Atrás
            </button>
          </div>
        )}

        {/* ── Paso 3 — Elegir template ──────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-3xl mb-3" aria-hidden="true">🖼️</p>
              <h2 className="text-2xl font-bold text-gray-900">Elige un template</h2>
              <p className="mt-2 text-sm text-gray-500">Puedes personalizar todo después.</p>
            </div>

            {templatesError && <Alert variant="error">{templatesError}</Alert>}

            {templatesLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-44 rounded-lg bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : templates.length === 0 && !templatesError ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay templates para esta categoría todavía.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {templates.map((tpl) => (
                  <TemplateCard
                    key={tpl.id}
                    template={tpl}
                    selected={selectedTemplateId === tpl.id}
                    onSelect={() =>
                      setSelectedTemplateId((prev) => (prev === tpl.id ? '' : tpl.id))
                    }
                  />
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                Atrás
              </Button>
              <Button type="button" onClick={handleStep3} className="flex-1">
                {selectedTemplateId ? 'Continuar con este template' : 'Continuar sin template'}
              </Button>
            </div>
          </div>
        )}

        {/* ── Paso 4 — Nombre del sitio ─────────────────────────────────────── */}
        {step === 4 && (
          <form onSubmit={step4Form.handleSubmit(handleStep4)} className="space-y-6">
            <div className="text-center">
              <p className="text-3xl mb-3" aria-hidden="true">🚀</p>
              <h2 className="text-2xl font-bold text-gray-900">Ponle nombre a tu sitio</h2>
              <p className="mt-2 text-sm text-gray-500">Define la URL con la que tu sitio estará disponible.</p>
            </div>

            <Input
              label="Nombre de tu sitio"
              placeholder="Mi Empresa"
              autoFocus
              error={step4Form.formState.errors.siteName?.message}
              {...step4Form.register('siteName', {
                onChange: (e) => {
                  const slug = slugify(e.target.value)
                  step4Form.setValue('siteSlug', slug, { shouldValidate: true })
                },
              })}
            />

            <div className="space-y-1">
              <Input
                label="Subdominio"
                placeholder="mi-empresa"
                error={step4Form.formState.errors.siteSlug?.message}
                {...step4Form.register('siteSlug')}
              />
              {step4Form.watch('siteSlug') && (
                <p className="text-xs text-gray-500">
                  Tu sitio quedará en:{' '}
                  <span className="font-medium text-primary-600">
                    {step4Form.watch('siteSlug')}.edithpress.com
                  </span>
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(3)} className="flex-1">
                Atrás
              </Button>
              <Button type="submit" className="flex-1">
                Crear sitio
              </Button>
            </div>
          </form>
        )}

        {/* ── Paso 5 — Creando / Listo ────────────────────────────────────────── */}
        {step === 5 && (
          <div className="space-y-6 text-center">
            {isCreating && (
              <>
                <div className="flex justify-center">
                  <div className="h-12 w-12 rounded-full border-4 border-primary-600 border-t-transparent animate-spin" aria-label="Creando tu sitio..." />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Creando tu sitio...</h2>
                  <p className="mt-2 text-sm text-gray-500">Esto solo tomará un momento.</p>
                </div>
              </>
            )}

            {!isCreating && createError && (
              <>
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Algo salió mal</h2>
                  <p className="mt-2 text-sm text-red-600">{createError}</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(4)}
                    className="flex-1"
                  >
                    Volver
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setCreateError(null)
                      setRetryCount((c) => c + 1)
                    }}
                    className="flex-1"
                  >
                    Intentar de nuevo
                  </Button>
                </div>
              </>
            )}

            {!isCreating && !createError && createdSite && (
              <>
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">¡Tu sitio está listo!</h2>
                  <p className="mt-2 text-sm text-gray-500">
                    {data.siteName} ha sido creado. Ahora personalízalo a tu gusto.
                  </p>
                </div>
                <Button size="lg" className="w-full" onClick={handleGoToBuilder}>
                  Empezar a editar mi sitio
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
