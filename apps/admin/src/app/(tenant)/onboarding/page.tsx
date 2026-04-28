'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Alert } from '@edithpress/ui'
import { api, getApiErrorMessage } from '@/lib/api-client'

// ── Tipos de sitio ─────────────────────────────────────────────────────────────

const SITE_TYPES = [
  { value: 'portfolio',  label: 'Portafolio', emoji: '🎨', desc: 'Muestra tu trabajo creativo' },
  { value: 'restaurant', label: 'Restaurante', emoji: '🍽️', desc: 'Menú, reservas y contacto' },
  { value: 'store',      label: 'Tienda',      emoji: '🛍️', desc: 'Catálogo de productos' },
  { value: 'services',   label: 'Servicios',   emoji: '💼', desc: 'Consultoría, coaching, etc.' },
  { value: 'blog',       label: 'Blog',        emoji: '✍️', desc: 'Artículos y contenido' },
  { value: 'other',      label: 'Otro',        emoji: '✨', desc: 'Cualquier otro tipo de sitio' },
]

// ── Schemas por paso ───────────────────────────────────────────────────────────

const step1Schema = z.object({
  businessName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
})

const step3Schema = z.object({
  siteName: z.string().min(2, 'El nombre del sitio debe tener al menos 2 caracteres').max(100),
  siteSlug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
})

type Step1Values = z.infer<typeof step1Schema>
type Step3Values = z.infer<typeof step3Schema>

function slugify(value: string) {
  return value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 50)
}

// ── Step indicator ─────────────────────────────────────────────────────────────

const STEP_LABELS = ['Tu negocio', 'Tipo de sitio', 'Tu sitio']

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-8" role="list" aria-label="Pasos del asistente de configuración">
      {/* Barras de progreso */}
      <div className="flex items-center gap-2 mb-3">
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

      {/* Etiquetas de pasos */}
      <div className="flex items-start gap-2">
        {Array.from({ length: total }).map((_, i) => {
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
                  isCurrent
                    ? 'text-primary-600'
                    : isDone
                      ? 'text-gray-400'
                      : 'text-gray-300'
                }`}
              >
                {isDone ? (
                  // Ícono de completado para pasos anteriores
                  <span className="inline-flex items-center justify-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {STEP_LABELS[i]}
                  </span>
                ) : (
                  STEP_LABELS[i]
                )}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [siteType, setSiteType] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1
  const step1Form = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: { businessName: '' },
  })

  // Step 3
  const step3Form = useForm<Step3Values>({
    resolver: zodResolver(step3Schema),
    defaultValues: { siteName: '', siteSlug: '' },
  })

  function handleStep1(values: Step1Values) {
    setBusinessName(values.businessName)
    step3Form.setValue('siteName', values.businessName)
    step3Form.setValue('siteSlug', slugify(values.businessName))
    setStep(1)
  }

  function handleStep2(type: string) {
    setSiteType(type)
    setStep(2)
  }

  async function handleStep3(values: Step3Values) {
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await api.post<{ data: { id: string } }>('/sites', {
        name: values.siteName,
        settings: { siteType, businessName },
      })
      router.push(`/sites/${data.data.id}?welcome=1`)
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo crear el sitio. Inténtalo de nuevo.'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-md p-8">
        <StepIndicator current={step} total={3} />

        {/* Paso 1 — Nombre del negocio */}
        {step === 0 && (
          <form onSubmit={step1Form.handleSubmit(handleStep1)} className="space-y-6">
            <div className="text-center">
              <p className="text-3xl mb-3">👋</p>
              <h2 className="text-2xl font-bold text-gray-900">¿Cómo se llama tu negocio?</h2>
              <p className="mt-2 text-sm text-gray-500">Puedes cambiar esto después.</p>
            </div>
            <Input
              label="Nombre del negocio"
              placeholder="Mi Empresa"
              autoFocus
              error={step1Form.formState.errors.businessName?.message}
              {...step1Form.register('businessName')}
            />
            <Button type="submit" size="lg" className="w-full">Continuar →</Button>
          </form>
        )}

        {/* Paso 2 — Tipo de sitio */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-3xl mb-3">🎯</p>
              <h2 className="text-2xl font-bold text-gray-900">¿Qué tipo de sitio necesitas?</h2>
              <p className="mt-2 text-sm text-gray-500">Elegiremos el template más adecuado para ti.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SITE_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleStep2(type.value)}
                  className="flex flex-col items-start gap-1 rounded-lg border-2 border-gray-200 p-4 text-left transition-all hover:border-primary-300 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                >
                  <span className="text-2xl">{type.emoji}</span>
                  <span className="text-sm font-semibold text-gray-900">{type.label}</span>
                  <span className="text-xs text-gray-500">{type.desc}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep(0)}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-md px-2 py-1"
            >
              ← Atrás
            </button>
          </div>
        )}

        {/* Paso 3 — Nombre del sitio */}
        {step === 2 && (
          <form onSubmit={step3Form.handleSubmit(handleStep3)} className="space-y-6">
            <div className="text-center">
              <p className="text-3xl mb-3">🚀</p>
              <h2 className="text-2xl font-bold text-gray-900">¡Ya casi terminamos!</h2>
              <p className="mt-2 text-sm text-gray-500">Define el nombre y la URL de tu sitio.</p>
            </div>

            {error && <Alert variant="error">{error}</Alert>}

            <div className="space-y-1">
              <Input
                label="Nombre del sitio"
                placeholder="Mi Empresa"
                error={step3Form.formState.errors.siteName?.message}
                {...step3Form.register('siteName', {
                  onChange: (e) => step3Form.setValue('siteSlug', slugify(e.target.value)),
                })}
              />
            </div>

            <div className="space-y-1">
              <Input
                label="URL de tu sitio"
                placeholder="mi-empresa"
                error={step3Form.formState.errors.siteSlug?.message}
                {...step3Form.register('siteSlug')}
              />
              {step3Form.watch('siteSlug') && (
                <p className="text-xs text-gray-500">
                  Tu sitio será:{' '}
                  <span className="font-medium text-primary-600">
                    {step3Form.watch('siteSlug')}.edithpress.com
                  </span>
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                ← Atrás
              </Button>
              <Button type="submit" loading={isLoading} className="flex-1">
                Crear mi sitio 🎉
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
