'use client'

import { useCallback, useEffect, useState } from 'react'
import { Badge, Alert } from '@edithpress/ui'
import { api, getApiErrorMessage } from '@/lib/api-client'

// ── Types (shape real del endpoint GET /admin/plans) ─────────────────────────

interface Plan {
  id: string
  name: string
  slug: string
  priceMonthly: number
  priceYearly: number
  maxSites: number       // -1 = ilimitado
  maxPages: number       // -1 = ilimitado
  maxStorageGB: number
  hasCustomDomain: boolean
  hasEcommerce: boolean
  hasAnalytics: boolean
  hasWhiteLabel: boolean
  tenantCount: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function limitLabel(value: number): string {
  return value === -1 ? 'Ilimitado' : String(value)
}

function BoolIcon({ value }: { value: boolean }) {
  return value ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500" aria-label="Incluido">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600" aria-label="No incluido">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

// ── Edit Modal ────────────────────────────────────────────────────────────────

function PlanEditModal({
  plan,
  onClose,
  onSaved,
}: {
  plan: Plan
  onClose: () => void
  onSaved: (updated: Plan) => void
}) {
  const [values, setValues] = useState({
    maxSites: plan.maxSites === -1 ? '' : String(plan.maxSites),
    maxPages: plan.maxPages === -1 ? '' : String(plan.maxPages),
    maxStorageGB: String(plan.maxStorageGB),
    hasCustomDomain: plan.hasCustomDomain,
    hasEcommerce: plan.hasEcommerce,
    hasAnalytics: plan.hasAnalytics,
    hasWhiteLabel: plan.hasWhiteLabel,
    priceMonthly: String(plan.priceMonthly),
    priceYearly: String(plan.priceYearly),
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const { data } = await api.patch<{ data: Plan }>(`/admin/plans/${plan.id}`, {
        maxSites: values.maxSites === '' ? -1 : Number(values.maxSites),
        maxPages: values.maxPages === '' ? -1 : Number(values.maxPages),
        maxStorageGB: Number(values.maxStorageGB),
        hasCustomDomain: values.hasCustomDomain,
        hasEcommerce: values.hasEcommerce,
        hasAnalytics: values.hasAnalytics,
        hasWhiteLabel: values.hasWhiteLabel,
        priceMonthly: Number(values.priceMonthly),
        priceYearly: Number(values.priceYearly),
      })
      onSaved(data.data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo guardar el plan.'))
    } finally {
      setSaving(false)
    }
  }

  function numField(label: string, key: keyof typeof values, suffix?: string) {
    return (
      <div>
        <label htmlFor={`plan-${key}`} className="block text-xs font-medium text-gray-400 mb-1">
          {label} {key !== 'maxStorageGB' && key !== 'priceMonthly' && key !== 'priceYearly' && (
            <span className="text-gray-600">(vacío = ilimitado)</span>
          )}
        </label>
        <div className="flex items-center gap-2">
          <input
            id={`plan-${key}`}
            type="number"
            min={0}
            value={values[key] as string}
            onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
            placeholder={key !== 'maxStorageGB' && key !== 'priceMonthly' && key !== 'priceYearly' ? '∞' : '0'}
            className="w-28 rounded-md border border-white/10 bg-gray-900 px-3 py-1.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {suffix && <span className="text-xs text-gray-500">{suffix}</span>}
        </div>
      </div>
    )
  }

  function boolField(label: string, key: 'hasCustomDomain' | 'hasEcommerce' | 'hasAnalytics' | 'hasWhiteLabel') {
    return (
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={values[key] as boolean}
          onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.checked }))}
          className="h-4 w-4 rounded border-gray-600 bg-gray-900 text-primary-600 focus:ring-primary-500"
        />
        <span className="text-sm text-gray-300">{label}</span>
      </label>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      role="dialog"
      aria-modal="true"
      aria-label={`Editar plan ${plan.name}`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-gray-950 border border-white/10 p-6 space-y-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Editar plan — {plan.name}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-md p-1"
            aria-label="Cerrar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {numField('Precio mensual (USD)', 'priceMonthly', '/mes')}
            {numField('Precio anual (USD)', 'priceYearly', '/año')}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Límites</p>
            <div className="grid grid-cols-3 gap-3">
              {numField('Sitios', 'maxSites')}
              {numField('Páginas', 'maxPages')}
              {numField('Almacenamiento', 'maxStorageGB', 'GB')}
            </div>
          </div>

          <div className="space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Funcionalidades</p>
            {boolField('Dominio personalizado', 'hasCustomDomain')}
            {boolField('E-commerce', 'hasEcommerce')}
            {boolField('Analítica', 'hasAnalytics')}
            {boolField('White-label', 'hasWhiteLabel')}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SuperAdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)

  const fetchPlans = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await api.get<{ data: Plan[] }>('/admin/plans')
      setPlans(data.data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudieron cargar los planes.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { void fetchPlans() }, [fetchPlans])

  function handleSaved(updated: Plan) {
    setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    setEditingPlan(null)
  }

  const columns = [
    'Plan', 'Precio/mes', 'Precio/año', 'Sitios', 'Páginas',
    'Storage', 'Dominio', 'Ecomm', 'Analytics', 'White-label', 'Tenants', '',
  ]

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-white">Planes</h1>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="rounded-xl border border-white/10 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 border-b border-white/10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400 whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5 bg-gray-950">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((_, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-4 rounded bg-gray-800 animate-pulse w-16" />
                    </td>
                  ))}
                </tr>
              ))
            ) : plans.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500">
                  No hay planes configurados.
                </td>
              </tr>
            ) : (
              plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4">
                    <p className="font-semibold text-white">{plan.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{plan.slug}</p>
                  </td>
                  <td className="px-4 py-4 text-gray-300 whitespace-nowrap">
                    {plan.priceMonthly === 0 ? (
                      <span className="text-green-400 font-medium">Gratis</span>
                    ) : (
                      `$${plan.priceMonthly}/mes`
                    )}
                  </td>
                  <td className="px-4 py-4 text-gray-300 whitespace-nowrap">
                    {plan.priceYearly === 0 ? '—' : `$${plan.priceYearly}/año`}
                  </td>
                  <td className="px-4 py-4 text-gray-300">{limitLabel(plan.maxSites)}</td>
                  <td className="px-4 py-4 text-gray-300">{limitLabel(plan.maxPages)}</td>
                  <td className="px-4 py-4 text-gray-300">{plan.maxStorageGB} GB</td>
                  <td className="px-4 py-4"><BoolIcon value={plan.hasCustomDomain} /></td>
                  <td className="px-4 py-4"><BoolIcon value={plan.hasEcommerce} /></td>
                  <td className="px-4 py-4"><BoolIcon value={plan.hasAnalytics} /></td>
                  <td className="px-4 py-4"><BoolIcon value={plan.hasWhiteLabel} /></td>
                  <td className="px-4 py-4 text-gray-300">{plan.tenantCount}</td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      onClick={() => setEditingPlan(plan)}
                      className="text-xs text-primary-400 hover:text-primary-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-1"
                      aria-label={`Editar plan ${plan.name}`}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingPlan && (
        <PlanEditModal
          plan={editingPlan}
          onClose={() => setEditingPlan(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
