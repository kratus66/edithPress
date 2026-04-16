'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, Badge, Button } from '@edithpress/ui'
import { api, getApiErrorMessage } from '@/lib/api-client'
import { useSites } from '@/hooks/useSites'

interface DashboardStats {
  sitesCount: number
  pagesCount: number
  visits30d: number
  planName: string
  planSlug: string
}

// ── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          {icon}
        </div>
      </div>
    </Card>
  )
}

// ── Site Row ─────────────────────────────────────────────────────────────────

function SiteRow({ id, name, isPublished, updatedAt }: { id: string; name: string; isPublished: boolean; updatedAt: string }) {
  const date = new Date(updatedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-gray-500">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{name}</p>
          <p className="text-xs text-gray-400">Editado {date}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={isPublished ? 'success' : 'default'}>
          {isPublished ? 'Publicado' : 'Borrador'}
        </Badge>
        <Link href={`/sites/${id}`}>
          <Button variant="ghost" size="sm">Ver</Button>
        </Link>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [statsError, setStatsError] = useState<string | null>(null)
  const { sites, isLoading: sitesLoading } = useSites()

  useEffect(() => {
    api.get<{ data: DashboardStats }>('/tenants/me/stats')
      .then(({ data }) => setStats(data.data))
      .catch((err) => setStatsError(getApiErrorMessage(err)))
  }, [])

  const isStarter = stats?.planSlug === 'starter'

  return (
    <div className="space-y-6">
      {/* Saludo */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Bienvenido 👋</h2>
          {stats && (
            <p className="text-sm text-gray-500 mt-0.5">
              Plan actual: <span className="font-medium text-gray-700">{stats.planName}</span>
            </p>
          )}
        </div>
        <Link href="/sites/new">
          <Button size="sm">+ Nuevo sitio</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Sitios activos"
          value={stats?.sitesCount ?? '—'}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>}
        />
        <StatCard
          label="Páginas publicadas"
          value={stats?.pagesCount ?? '—'}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>}
        />
        <StatCard
          label="Visitas (30d)"
          value={stats?.visits30d ?? '—'}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>}
        />
        <StatCard
          label="Plan"
          value={stats?.planName ?? '—'}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>}
        />
      </div>

      {/* Upgrade banner */}
      {isStarter && (
        <div className="flex items-center justify-between rounded-lg bg-primary-50 border border-primary-100 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-primary-900">⚡ Actualiza a Business</p>
            <p className="text-xs text-primary-700 mt-0.5">Más sitios, dominio propio y analítica avanzada.</p>
          </div>
          <Link href="/billing/upgrade">
            <Button size="sm" variant="outline" className="border-primary-300 text-primary-700 hover:bg-primary-100">
              Ver planes
            </Button>
          </Link>
        </div>
      )}

      {/* Mis sitios */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">Mis sitios</h3>
          <Link href="/sites" className="text-sm text-primary-600 hover:underline underline-offset-4">
            Ver todos
          </Link>
        </div>

        {sitesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-md bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : sites.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-500">Aún no tienes sitios.</p>
            <Link href="/sites/new">
              <Button variant="outline" size="sm" className="mt-3">Crear mi primer sitio</Button>
            </Link>
          </div>
        ) : (
          <div>
            {sites.slice(0, 5).map((site) => (
              <SiteRow key={site.id} {...site} />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
