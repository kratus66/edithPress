'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Button, Card, Badge, Switch, Alert } from '@edithpress/ui'
import { api, getApiErrorMessage } from '@/lib/api-client'

// ── Types ──────────────────────────────────────────────────────────────────────

type BillingInterval = 'monthly' | 'yearly'

interface PlanPrice {
  monthly: number
  yearly: number
}

interface Plan {
  id: string
  slug: string
  name: string
  description: string
  prices: PlanPrice
  features: string[]
  popular?: boolean
  disabled?: boolean
}

// ── Planes mock — TODO: reemplazar con datos reales de GET /api/v1/billing/plans
const MOCK_PLANS: Plan[] = [
  {
    id: 'plan-starter',
    slug: 'starter',
    name: 'Starter',
    description: 'Para empezar a explorar',
    prices: { monthly: 0, yearly: 0 },
    features: [
      '1 sitio',
      '5 paginas',
      '1 GB almacenamiento',
      'Subdominio .edithpress.com',
      'Soporte por email',
    ],
    disabled: true,
  },
  {
    id: 'plan-business',
    slug: 'business',
    name: 'Business',
    description: 'Para negocios en crecimiento',
    prices: { monthly: 19, yearly: 15 },
    features: [
      '3 sitios',
      'Paginas ilimitadas',
      '10 GB almacenamiento',
      'Dominio personalizado',
      'Analitica basica',
      'Soporte prioritario',
    ],
    popular: true,
  },
  {
    id: 'plan-pro',
    slug: 'pro',
    name: 'Pro',
    description: 'Para equipos y agencias',
    prices: { monthly: 49, yearly: 39 },
    features: [
      'Sitios ilimitados',
      'Paginas ilimitadas',
      '50 GB almacenamiento',
      'Multiples dominios',
      'Analitica avanzada',
      'White-label',
      'API publica',
    ],
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UpgradePage() {
  const [interval, setInterval] = useState<BillingInterval>('monthly')
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  // TODO: conectar a API real GET /api/v1/billing/plans cuando este disponible
  const { data: plans } = useQuery<Plan[]>({
    queryKey: ['billing-plans'],
    queryFn: async () => {
      const { data } = await api.get<{ data: Plan[] }>('/billing/plans')
      return data.data
    },
    placeholderData: MOCK_PLANS,
    retry: false,
  })

  const displayPlans = plans ?? MOCK_PLANS

  async function handleCheckout(planSlug: string) {
    setCheckoutError(null)
    setCheckoutLoading(planSlug)
    try {
      const { data } = await api.post<{ data: { url: string } }>('/billing/checkout', {
        planSlug,
        interval,
      })
      window.location.href = data.data.url
    } catch (err) {
      setCheckoutError(getApiErrorMessage(err, 'No se pudo iniciar el proceso de pago.'))
    } finally {
      setCheckoutLoading(null)
    }
  }

  function getPriceLabel(plan: Plan): string {
    const price = plan.prices[interval]
    if (price === 0) return 'Gratis'
    const period = interval === 'monthly' ? 'mes' : 'mes (facturado anual)'
    return `$${price}/${period}`
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Elige tu plan</h2>
        <p className="text-sm text-gray-500">Cancela cuando quieras. Sin permanencia.</p>

        {/* Toggle mensual / anual */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setInterval('monthly')}
              className={`text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-sm px-1 ${
                interval === 'monthly' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-pressed={interval === 'monthly'}
            >
              Mensual
            </button>

            <Switch
              checked={interval === 'yearly'}
              onCheckedChange={(checked) => setInterval(checked ? 'yearly' : 'monthly')}
              aria-label={
                interval === 'yearly'
                  ? 'Actualmente en facturación anual — cambiar a mensual'
                  : 'Cambiar a facturación anual y ahorrar 20%'
              }
            />

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setInterval('yearly')}
                className={`text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-sm px-1 ${
                  interval === 'yearly' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                }`}
                aria-pressed={interval === 'yearly'}
              >
                Anual
              </button>
              <Badge
                variant={interval === 'yearly' ? 'success' : 'default'}
                className="text-xs font-semibold transition-colors"
              >
                Ahorra 20%
              </Badge>
            </div>
          </div>

          {/* Nota contextual según selección */}
          <p className="text-xs text-center text-gray-500 min-h-[1.25rem]">
            {interval === 'yearly'
              ? 'Facturado una vez al año — cancela cuando quieras'
              : 'Paga mes a mes, sin compromiso'}
          </p>
        </div>
      </div>

      {checkoutError && (
        <Alert variant="error" onDismiss={() => setCheckoutError(null)}>
          {checkoutError}
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {displayPlans.map((plan) => (
          <Card
            key={plan.slug}
            className={`p-6 flex flex-col relative ${
              plan.popular
                ? 'border-2 border-primary-600 shadow-md'
                : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="primary" className="px-3 py-1">Mas popular</Badge>
              </div>
            )}

            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {plan.name}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {getPriceLabel(plan)}
              </p>
              {plan.prices[interval] > 0 && interval === 'yearly' && (
                <p className="mt-1 text-xs text-green-600 font-medium">
                  Equivale a ${plan.prices.yearly * 12}/ano
                  {' '}
                  <span className="line-through text-gray-400">
                    ${plan.prices.monthly * 12}
                  </span>
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
            </div>

            <ul className="flex-1 space-y-2 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary-600 shrink-0"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            {plan.disabled ? (
              <Button variant="outline" disabled className="w-full">
                Plan actual
              </Button>
            ) : (
              <Button
                type="button"
                variant={plan.popular ? 'primary' : 'outline'}
                className="w-full"
                loading={checkoutLoading === plan.slug}
                onClick={() => handleCheckout(plan.slug)}
              >
                Elegir {plan.name}
              </Button>
            )}
          </Card>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400">
        Precios en USD. IVA puede aplicar segun tu pais.{' '}
        <Link href="/billing" className="text-primary-600 hover:underline">
          Volver a facturacion
        </Link>
      </p>
    </div>
  )
}
