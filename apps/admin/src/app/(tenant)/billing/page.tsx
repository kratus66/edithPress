'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button, Card, Badge, Alert } from '@edithpress/ui'
import { api, getApiErrorMessage } from '@/lib/api-client'

interface BillingData {
  plan: { name: string; slug: string; maxSites: number; maxPages: number; maxStorageGB: number; priceMonthly: string }
  subscription: { status: string; currentPeriodEnd: string; cancelAtPeriodEnd: boolean } | null
  usage: { sites: number; pages: number; storageMB: number }
  invoices: Array<{ id: string; amount: string; currency: string; status: string; createdAt: string; pdfUrl?: string }>
}

function UsageBar({ label, used, max }: { label: string; used: number; max: number }) {
  const pct = max < 0 ? 0 : Math.min(100, (used / max) * 100)
  const isUnlimited = max < 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">
          {used} {isUnlimited ? '/ ∞' : `/ ${max}`}
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
          />
        </div>
      )}
    </div>
  )
}

export default function BillingPage() {
  const [billing, setBilling] = useState<BillingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    api.get<{ data: BillingData }>('/billing/current')
      .then(({ data }) => setBilling(data.data))
      .catch((err) => setError(getApiErrorMessage(err, 'No se pudo cargar la información de facturación.')))
      .finally(() => setIsLoading(false))
  }, [])

  async function openPortal() {
    setPortalLoading(true)
    try {
      const { data } = await api.post<{ data: { url: string } }>('/billing/portal')
      window.location.href = data.data.url
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo abrir el portal de facturación.'))
    } finally {
      setPortalLoading(false)
    }
  }

  if (isLoading) return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-xl bg-gray-100 animate-pulse" />)}
    </div>
  )

  if (error) return <Alert variant="error">{error}</Alert>
  if (!billing) return null

  const periodEnd = billing.subscription
    ? new Date(billing.subscription.currentPeriodEnd).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-semibold text-gray-900">Facturación</h2>

      {/* Plan actual */}
      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
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
            <Link href="/billing/upgrade">
              <Button size="sm">Cambiar plan</Button>
            </Link>
            {billing.subscription && (
              <Button variant="outline" size="sm" onClick={openPortal} loading={portalLoading}>
                Gestionar suscripción
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Uso */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900">Uso del plan</h3>
        <UsageBar label="Sitios" used={billing.usage.sites} max={billing.plan.maxSites} />
        <UsageBar label="Páginas" used={billing.usage.pages} max={billing.plan.maxPages} />
        <UsageBar
          label="Almacenamiento"
          used={Math.round(billing.usage.storageMB / 1024 * 10) / 10}
          max={billing.plan.maxStorageGB}
        />
      </Card>

      {/* Facturas */}
      <Card className="p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Historial de facturas</h3>
        {billing.invoices.length === 0 ? (
          <p className="text-sm text-gray-500">No hay facturas aún.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {billing.invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    ${inv.amount} {inv.currency.toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(inv.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={inv.status === 'paid' ? 'success' : 'warning'}>
                    {inv.status === 'paid' ? 'Pagada' : inv.status}
                  </Badge>
                  {inv.pdfUrl && (
                    <a href={inv.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline">
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
