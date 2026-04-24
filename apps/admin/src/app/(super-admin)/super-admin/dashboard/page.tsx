'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, Badge, Alert } from '@edithpress/ui'
import { api, getApiErrorMessage } from '@/lib/api-client'

// ── Types ─────────────────────────────────────────────────────────────────────

interface AdminStats {
  totalTenants: number
  newThisWeek: number
  mrr: number
  publishedSites: number
}

interface Tenant {
  id: string
  name: string
  slug: string
  planName: string
  isActive: boolean
  siteCount: number
  createdAt: string
}

interface TenantsResponse {
  data: Tenant[]
  meta: { total: number; page: number; limit: number; totalPages: number }
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  color = 'primary',
}: {
  label: string
  value: string
  sub?: string
  color?: 'primary' | 'green' | 'orange'
}) {
  const colorMap = {
    primary: 'text-primary-400',
    green: 'text-green-400',
    orange: 'text-orange-400',
  }
  return (
    <Card className="p-5 bg-gray-900 border-white/10">
      <p className="text-sm text-gray-400">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${colorMap[color]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </Card>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentTenants, setRecentTenants] = useState<Tenant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, tenantsRes] = await Promise.all([
          api.get<{ data: AdminStats }>('/admin/stats'),
          api.get<TenantsResponse>('/admin/tenants?limit=10&page=1'),
        ])
        setStats(statsRes.data.data)
        setRecentTenants(tenantsRes.data.data)
      } catch (err) {
        setError(getApiErrorMessage(err, 'No se pudieron cargar las métricas.'))
      } finally {
        setIsLoading(false)
      }
    }
    void load()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-gray-800 animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-gray-800 animate-pulse" />
      </div>
    )
  }

  if (error) return <Alert variant="error">{error}</Alert>

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-white">Dashboard Global</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Total tenants"
          value={stats?.totalTenants.toLocaleString() ?? '—'}
          sub={`+${stats?.newThisWeek ?? 0} esta semana`}
          color="primary"
        />
        <KpiCard
          label="Nuevos esta semana"
          value={stats?.newThisWeek.toLocaleString() ?? '—'}
          color="orange"
        />
        <KpiCard
          label="MRR"
          value={stats ? `$${stats.mrr.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
          sub="Ingresos recurrentes mensuales"
          color="green"
        />
        <KpiCard
          label="Sitios publicados"
          value={stats?.publishedSites.toLocaleString() ?? '—'}
          color="primary"
        />
      </div>

      {/* Últimos tenants */}
      <Card className="overflow-hidden bg-gray-900 border-white/10">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="text-base font-semibold text-white">Últimos tenants registrados</h3>
          <Link
            href="/super-admin/tenants"
            className="text-xs text-primary-400 hover:text-primary-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded"
          >
            Ver todos →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
              <tr>
                {['Tenant', 'Plan', 'Sitios', 'Estado', 'Registrado'].map((col) => (
                  <th
                    key={col}
                    className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentTenants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-500 text-sm">
                    No hay tenants registrados.
                  </td>
                </tr>
              ) : (
                recentTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-white">{tenant.name}</p>
                      <p className="text-xs text-gray-500">{tenant.slug}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-300">{tenant.planName}</td>
                    <td className="px-5 py-3 text-gray-300">{tenant.siteCount}</td>
                    <td className="px-5 py-3">
                      <Badge variant={tenant.isActive ? 'success' : 'warning'}>
                        {tenant.isActive ? 'Activo' : 'Suspendido'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {new Date(tenant.createdAt).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
