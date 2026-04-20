'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button, Card, Badge, Alert, Switch } from '@edithpress/ui'
import { api, getApiErrorMessage } from '@/lib/api-client'

// ── Types ──────────────────────────────────────────────────────────────────────

type BillingInterval = 'monthly' | 'yearly'

interface BillingData {
  plan: {
    name: string
    slug: string
    maxSites: number
    maxPages: number
    maxStorageGB: number
    priceMonthly: string
  }
  subscription: {
    status: string
    currentPeriodEnd: string
    cancelAtPeriodEnd: boolean
    interval?: BillingInterval
  } | null
  usage: { sites: number; pages: number; storageMB: number }
  invoices: Array<{
    id: string
    amount: string
    currency: string
    status: string
    createdAt: string
    pdfUrl?: string
  }>
}

interface ApiPlan {
  id: string
  name: string
  priceMonthly: number
  priceYearly: number
  maxSites: number
  maxPages: number
  maxStorageGB: number
  hasCustomDomain: boolean
  hasAnalytics: boolean
  hasEcommerce: boolean
  hasWhiteLabel: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildFeatures(plan: ApiPlan): string[] {
  const feats: string[] = []
  feats.push(
    plan.maxSites === -1
      ? 'Sitios ilimitados'
      : `${plan.maxSites} sitio${plan.maxSites !== 1 ? 's' : ''}`
  )
  feats.push(
    plan.maxPages === -1
      ? 'Paginas ilimitadas'
      : `${plan.maxPages} paginas`
  )
  feats.push(`${plan.maxStorageGB} GB almacenamiento`)
  if (plan.hasCustomDomain) feats.push('Dominio personalizado')
  if (plan.hasAnalytics) feats.push('Analitica avanzada')
  if (plan.hasEcommerce) feats.push('E-commerce')
  if (plan.hasWhiteLabel) feats.push('White-label')
  return feats
}

// ── Usage bar ─────────────────────────────────────────────────────────────────

function UsageBar({ label, used, max }: { label: string; used: number; max: number }) {
  const isUnlimited = max < 0
  const pct = isUnlimited ? 0 : Math.min(100, (used / max) * 100)
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">
          {used} {isUnlimited ? '/ \u221e' : `/ ${max}`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-1.5 w-full rounded-full bg-gray-100">
          <div
            className={`h-1.5 rounded-full transition-all ${pct > 80 ? 'bg-orange-500' : 'bg-primary-600'}`}
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={used}
            aria-valuemax={max}
            aria-label={label}
          />
        </div>
      )}
    </div>
  )
}

// ── Plan card ─────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  interval,
  currentPlanSlug,
  onCheckout,
  isCheckingOut,
}: {
  plan: ApiPlan
  interval: BillingInterval
  currentPlanSlug: string
  onCheckout: (planId: string, interval: BillingInterval) => void
  isCheckingOut: boolean
}) {
  const price = interval === 'monthly' ? plan.priceMonthly : plan.priceYearly
  const isCurrent = plan.name.toLowerCase() === currentPlanSlug.toLowerCase()
  const isFree = plan.priceMonthly === 0
  const isPopular = plan.name.toLowerCase() === 'business'

  const priceLabel = isFree
    ? 'Gratis'
    : interval === 'monthly'
    ? `$${price}/mes`
    : `$${price}/mes`

  const features = buildFeatures(plan)

  return (
    <Card
      className={`p-6 flex flex-col relative ${
        isPopular ? 'border-2 border-primary-600 shadow-md' : ''
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="primary" className="px-3 py-1 text-xs font-semibold">
            Mas popular
          </Badge>
        </div>
      )}

      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          {plan.name}
        </p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{priceLabel}</p>
        {!isFree && interval === 'yearly' && (
          <p className="mt-0.5 text-xs text-green-600 font-medium">
            ${(plan.priceYearly * 12).toFixed(0)} facturado anualmente
            {' '}
            <span className="text-gray-400 line-through">
              ${(plan.priceMonthly * 12).toFixed(0)}
            </span>
          </p>
        )}
        {!isFree && interval === 'monthly' && (
          <p className="mt-0.5 text-xs text-gray-400">facturado mensualmente</p>
        )}
      </div>

      <ul className="flex-1 space-y-2 mb-6">
        {features.map((f) => (
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

      {isCurrent ? (
        <Button variant="outline" disabled className="w-full">
          Plan actual
        </Button>
      ) : isFree ? (
        <Button variant="outline" disabled className="w-full">
          Gratis
        </Button>
      ) : (
        <Button
          type="button"
          variant={isPopular ? 'primary' : 'outline'}
          className="w-full"
          loading={isCheckingOut}
          onClick={() => onCheckout(plan.id, interval)}
        >
          Contratar {plan.name}
        </Button>
      )}
    </Card>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-32 rounded-xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const [interval, setInterval] = useState<BillingInterval>('monthly')
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [checkoutLoadingId, setCheckoutLoadingId] = useState<string | null>(null)

  // Current billing info
  const {
    data: billing,
    isLoading: billingLoading,
    isError: billingError,
  } = useQuery<BillingData>({
    queryKey: ['billing-current'],
    queryFn: async () => {
      const { data } = await api.get<{ data: BillingData }>('/billing/current')
      return data.data
    },
    retry: false,
    staleTime: 60_000,
  })

  // Available plans
  const { data: plans, isLoading: plansLoading } = useQuery<ApiPlan[]>({
    queryKey: ['billing-plans'],
    queryFn: async () => {
      const { data } = await api.get<{ data: ApiPlan[] }>('/billing/plans')
      return data.data
    },
    retry: false,
    staleTime: 5 * 60_000,
  })

  // Stripe portal mutation
  const portalMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<{ data: { url: string } }>('/billing/portal')
      return data.data.url
    },
    onSuccess: (url) => {
      window.location.href = url
    },
    onError: (err) => {
      setCheckoutError(getApiErrorMessage(err, 'No se pudo abrir el portal de facturacion.'))
    },
    onSettled: () => setPortalLoading(false),
  })

  async function openPortal() {
    setPortalLoading(true)
    portalMutation.mutate()
  }

  async function handleCheckout(planId: string, selectedInterval: BillingInterval) {
    setCheckoutError(null)
    setCheckoutLoadingId(planId)
    try {
      const { data } = await api.post<{ data: { url: string } }>('/billing/checkout', {
        planId,
        interval: selectedInterval,
      })
      window.location.href = data.data.url
    } catch (err) {
      setCheckoutError(getApiErrorMessage(err, 'No se pudo iniciar el proceso de pago.'))
    } finally {
      setCheckoutLoadingId(null)
    }
  }

  if (billingLoading) return <PageSkeleton />

  if (billingError) {
    return (
      <Alert variant="error">
        No se pudo cargar la informacion de facturacion. Intenta de nuevo mas tarde.
      </Alert>
    )
  }

  if (!billing) return null

  const periodEnd = billing.subscription
    ? new Date(billing.subscription.currentPeriodEnd).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <div className="space-y-10 max-w-5xl">
      <h2 className="text-xl font-semibold text-gray-900">Facturacion</h2>

      {checkoutError && (
        <Alert variant="error" onDismiss={() => setCheckoutError(null)}>
          {checkoutError}
        </Alert>
      )}

      {/* Current plan */}
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-gray-500 mb-1">Plan actual</p>
            <p className="text-2xl font-bold text-gray-900">{billing.plan.name}</p>
            {billing.plan.priceMonthly === '0.00' ? (
              <p className="text-sm text-gray-500 mt-1">Gratis</p>
            ) : (
              <p className="text-sm text-gray-500 mt-1">
                ${billing.plan.priceMonthly} / mes
              </p>
            )}
            {periodEnd && (
              <p className="text-xs text-gray-400 mt-1">
                {billing.subscription?.cancelAtPeriodEnd
                  ? `Cancela el ${periodEnd}`
                  : `Renueva el ${periodEnd}`}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            {billing.subscription && (
              <Button
                variant="outline"
                size="sm"
                onClick={openPortal}
                loading={portalLoading}
              >
                Gestionar suscripcion
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Usage */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900">Uso del plan</h3>
        <UsageBar
          label="Sitios"
          used={billing.usage.sites}
          max={billing.plan.maxSites}
        />
        <UsageBar
          label="Paginas"
          used={billing.usage.pages}
          max={billing.plan.maxPages}
        />
        <UsageBar
          label="Almacenamiento (GB)"
          used={Math.round((billing.usage.storageMB / 1024) * 10) / 10}
          max={billing.plan.maxStorageGB}
        />
      </Card>

      {/* Plan selector */}
      <section aria-labelledby="plans-heading" className="space-y-6">
        <div className="text-center space-y-3">
          <h3 id="plans-heading" className="text-lg font-semibold text-gray-900">
            Cambia tu plan
          </h3>
          <p className="text-sm text-gray-500">
            Cancela cuando quieras. Sin permanencia.
          </p>

          {/* Monthly / yearly toggle */}
          <div className="flex items-center justify-center gap-3">
            <span
              className={`text-sm font-medium ${
                interval === 'monthly' ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              Mensual
            </span>
            <Switch
              checked={interval === 'yearly'}
              onCheckedChange={(checked) =>
                setInterval(checked ? 'yearly' : 'monthly')
              }
              aria-label="Cambiar a facturacion anual"
            />
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium ${
                  interval === 'yearly' ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                Anual
              </span>
              {interval === 'yearly' && (
                <Badge variant="success" className="text-xs font-semibold">
                  Ahorra 2 meses
                </Badge>
              )}
            </div>
          </div>
        </div>

        {plansLoading ? (
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-80 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : plans && plans.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                interval={interval}
                currentPlanSlug={billing.plan.slug}
                onCheckout={handleCheckout}
                isCheckingOut={checkoutLoadingId === plan.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">No se pudieron cargar los planes.</p>
            <Link href="/billing/upgrade">
              <Button variant="outline" size="sm" className="mt-3">
                Ver planes disponibles
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* Invoices */}
      <Card className="p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Historial de facturas
        </h3>
        {billing.invoices.length === 0 ? (
          <p className="text-sm text-gray-500">No hay facturas aun.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {billing.invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    ${inv.amount} {inv.currency.toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(inv.createdAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={inv.status === 'paid' ? 'success' : 'warning'}>
                    {inv.status === 'paid' ? 'Pagada' : inv.status}
                  </Badge>
                  {inv.pdfUrl && (
                    <a
                      href={inv.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-600 hover:underline"
                    >
                      PDF
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
