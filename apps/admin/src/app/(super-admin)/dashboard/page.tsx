'use client'

import { useEffect, useState } from 'react'
import { Card, Alert } from '@edithpress/ui'
import { api, getApiErrorMessage } from '@/lib/api-client'

interface SuperAdminStats {
  mrr: number; arr: number; activeTenantsCount: number
  newTenantsThisWeek: number; churnRate: number
  planDistribution: Array<{ planName: string; count: number }>
}

function KpiCard({ label, value, sub, color = 'primary' }: {
  label: string; value: string; sub?: string; color?: 'primary' | 'green' | 'orange' | 'red'
}) {
  const colorMap = {
    primary: 'text-primary-600',
    green:   'text-green-600',
    orange:  'text-orange-500',
    red:     'text-red-600',
  }
  return (
    <Card className="p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${colorMap[color]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </Card>
  )
}

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState<SuperAdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.get<{ data: SuperAdminStats }>('/admin/stats')
      .then(({ data }) => setStats(data.data))
      .catch((err) => setError(getApiErrorMessage(err, 'No se pudieron cargar las métricas.')))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-xl bg-gray-800 animate-pulse" />)}
      </div>
    </div>
  )

  if (error) return <Alert variant="error">{error}</Alert>

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Dashboard Global</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 [&>*]:bg-gray-900 [&>*]:border-white/10">
        <KpiCard label="MRR" value={stats ? `$${stats.mrr.toLocaleString()}` : '—'} sub="Ingresos recurrentes mensuales" color="green" />
        <KpiCard label="ARR" value={stats ? `$${stats.arr.toLocaleString()}` : '—'} sub="Ingresos recurrentes anuales" color="primary" />
        <KpiCard label="Tenants activos" value={stats?.activeTenantsCount?.toLocaleString() ?? '—'} sub={`+${stats?.newTenantsThisWeek ?? 0} esta semana`} color="primary" />
        <KpiCard label="Churn rate" value={stats ? `${stats.churnRate.toFixed(1)}%` : '—'} sub="Últimos 30 días" color={stats && stats.churnRate > 5 ? 'red' : 'green'} />
      </div>

      {/* Distribución de planes */}
      {stats?.planDistribution && stats.planDistribution.length > 0 && (
        <Card className="p-5 bg-gray-900 border-white/10">
          <h3 className="text-base font-semibold text-white mb-4">Distribución por plan</h3>
          <div className="space-y-3">
            {stats.planDistribution.map((item) => {
              const total = stats.planDistribution.reduce((sum, p) => sum + p.count, 0)
              const pct = total > 0 ? Math.round((item.count / total) * 100) : 0
              return (
                <div key={item.planName}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{item.planName}</span>
                    <span className="text-white font-medium">{item.count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-800">
                    <div
                      className="h-1.5 rounded-full bg-primary-500"
                      style={{ width: `${pct}%` }}
                      role="progressbar"
                      aria-valuenow={item.count}
                      aria-valuemax={total}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
