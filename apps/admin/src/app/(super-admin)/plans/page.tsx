'use client'

import { useCallback, useEffect, useState } from 'react'
import { Badge, Alert } from '@edithpress/ui'
import { api, getApiErrorMessage } from '@/lib/api-client'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Plan {
  id: string
  slug: string
  name: string
  price: number              // USD/mes
  isActive: boolean
  limits: {
    maxSites: number | null      // null = ilimitado
    maxPages: number | null
    maxStorageGb: number | null
    customDomain: boolean
    analytics: boolean
    whiteLabel: boolean
    apiAccess: boolean
  }
  tenantsCount: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function limitLabel(value: number | null, suffix = ''): string {
  if (value === null) return 'Ilimitado'
  return `${value}${suffix}`
}

function boolLabel(value: boolean) {
  return value ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500" aria-label="Incluido">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300" aria-label="No incluido">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

// ── Toggle Switch ─────────────────────────────────────────────────────────────

function ToggleSwitch({
  checked,
  onChange,
  loading,
  label,
}: {
  checked: boolean
  onChange: () => void
  loading: boolean
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={loading}
      onClick={onChange}
      className={[
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        checked ? 'bg-green-500' : 'bg-gray-600',
      ].join(' ')}
    >
      <span
        className={[
          'pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200',
          checked ? 'translate-x-4' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
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
    name: plan.name,
    price: plan.price,
    maxSites: plan.limits.maxSites ?? '',
    maxPages: plan.limits.maxPages ?? '',
    maxStorageGb: plan.limits.maxStorageGb ?? '',
    customDomain: plan.limits.customDomain,
    analytics: plan.limits.analytics,
    whiteLabel: plan.limits.whiteLabel,
    apiAccess: plan.limits.apiAccess,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const { data } = await api.patch<{ data: Plan }>(`/admin/plans/${plan.id}`, {
        name: values.name,
        price: Number(values.price),
        limits: {
          maxSites: values.maxSites === '' ? null : Number(values.maxSites),
          maxPages: values.maxPages === '' ? null : Number(values.maxPages),
          maxStorageGb: values.maxStorageGb === '' ? null : Number(values.maxStorageGb),
          customDomain: values.customDomain,
          analytics: values.analytics,
          whiteLabel: values.whiteLabel,
          apiAccess: values.apiAccess,
        },
      })
      onSaved(data.data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo guardar el plan.'))
    } finally {
      setSaving(false)
    }
  }

  function field(
    label: string,
    key: 'maxSites' | 'maxPages' | 'maxStorageGb',
    suffix?: string,
  ) {
    return (
      <div>
        <label htmlFor={`plan-${key}`} className="block text-xs font-medium text-gray-400 mb-1">
          {label} <span className="text-gray-600">(vacío = ilimitado)</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            id={`plan-${key}`}
            type="number"
            min={0}
            value={values[key]}
            onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
            placeholder="∞"
            className="w-28 rounded-md border border-white/10 bg-gray-900 px-3 py-1.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {suffix && <span className="text-xs text-gray-500">{suffix}</span>}
        </div>
      </div>
    )
  }

  function boolField(label: string, key: 'customDomain' | 'analytics' | 'whiteLabel' | 'apiAccess') {
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
    >
      <div className="w-full max-w-md rounded-2xl bg-gray-950 border border-white/10 p-6 space-y-5 shadow-2xl">
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
            <div>
              <label htmlFor="plan-name" className="block text-xs font-medium text-gray-400 mb-1">Nombre</label>
              <input
                id="plan-name"
                type="text"
                value={values.name}
                onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                className="w-full rounded-md border border-white/10 bg-gray-900 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label htmlFor="plan-price" className="block text-xs font-medium text-gray-400 mb-1">Precio (USD/mes)</label>
              <input
                id="plan-price"
                type="number"
                min={0}
                value={values.price}
                onChange={(e) => setValues((v) => ({ ...v, price: Number(e.target.value) }))}
                className="w-full rounded-md border border-white/10 bg-gray-900 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Límites</p>
            <div className="grid grid-cols-3 gap-3">
              {field('Sitios', 'maxSites')}
              {field('Páginas', 'maxPages')}
              {field('Almacenamiento', 'maxStorageGb', 'GB')}
            </div>
          </div>

          <div className="space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Funcionalidades</p>
            {boolField('Dominio personalizado', 'customDomain')}
            {boolField('Analítica', 'analytics')}
            {boolField('White-label', 'whiteLabel')}
            {boolField('Acceso a API', 'apiAccess')}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
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
  const [togglingId, setTogglingId] = useState<string | null>(null)
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

  async function handleToggleActive(plan: Plan) {
    setTogglingId(plan.id)
    setError(null)
    try {
      await api.patch(`/admin/plans/${plan.id}`, { isActive: !plan.isActive })
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, isActive: !p.isActive } : p)),
      )
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo cambiar el estado del plan.'))
    } finally {
      setTogglingId(null)
    }
  }

  function handleSaved(updated: Plan) {
    setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    setEditingPlan(null)
  }

  const columns = [
    'Plan',
    'Precio',
    'Sitios',
    'Páginas',
    'Almac.',
    'Dominio propio',
    'Analítica',
    'White-label',
    'API',
    'Tenants',
    'Estado',
    '',
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Planes</h1>
      </div>

      {error && (
        <Alert variant="error" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

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
                <tr
                  key={plan.id}
                  className={`hover:bg-white/5 transition-colors ${!plan.isActive ? 'opacity-50' : ''}`}
                >
                  {/* Name + slug */}
                  <td className="px-4 py-4">
                    <p className="font-semibold text-white">{plan.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{plan.slug}</p>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-4 text-gray-300 whitespace-nowrap">
                    {plan.price === 0 ? (
                      <span className="text-green-400 font-medium">Gratis</span>
                    ) : (
                      `$${plan.price}/mes`
                    )}
                  </td>

                  {/* Limits */}
                  <td className="px-4 py-4 text-gray-300">
                    {limitLabel(plan.limits.maxSites)}
                  </td>
                  <td className="px-4 py-4 text-gray-300">
                    {limitLabel(plan.limits.maxPages)}
                  </td>
                  <td className="px-4 py-4 text-gray-300">
                    {limitLabel(plan.limits.maxStorageGb, ' GB')}
                  </td>

                  {/* Boolean features */}
                  <td className="px-4 py-4">{boolLabel(plan.limits.customDomain)}</td>
                  <td className="px-4 py-4">{boolLabel(plan.limits.analytics)}</td>
                  <td className="px-4 py-4">{boolLabel(plan.limits.whiteLabel)}</td>
                  <td className="px-4 py-4">{boolLabel(plan.limits.apiAccess)}</td>

                  {/* Tenants count */}
                  <td className="px-4 py-4 text-gray-300">{plan.tenantsCount}</td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <Badge variant={plan.isActive ? 'success' : 'default'}>
                      {plan.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <ToggleSwitch
                        checked={plan.isActive}
                        onChange={() => handleToggleActive(plan)}
                        loading={togglingId === plan.id}
                        label={`${plan.isActive ? 'Desactivar' : 'Activar'} plan ${plan.name}`}
                      />
                      <button
                        type="button"
                        onClick={() => setEditingPlan(plan)}
                        className="text-xs text-gray-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded px-1"
                        aria-label={`Editar plan ${plan.name}`}
                      >
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Note */}
      {!isLoading && plans.some((p) => !p.isActive) && (
        <p className="text-xs text-gray-500">
          Los planes inactivos no se muestran en la pantalla de upgrade para nuevos tenants.
          Los tenants ya suscritos a ese plan no se ven afectados.
        </p>
      )}

      {/* Edit modal */}
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
