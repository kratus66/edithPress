'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, Alert } from '@edithpress/ui'
import { api, getApiErrorMessage } from '@/lib/api-client'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Site {
  id: string
  name: string
}

interface TopPage {
  path: string
  views: number
  percentage: number
}

interface ViewByDay {
  date: string   // "YYYY-MM-DD"
  views: number
}

interface Referrer {
  referrer: string | null
  count: number
}

interface AnalyticsData {
  totalViews: number
  uniquePaths: number
  topPages: TopPage[]
  viewsByDay: ViewByDay[]
  referrers: Referrer[]
}

type Period = '7d' | '30d' | '90d'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

// ── Metric Card ───────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  suffix = '',
  icon,
}: {
  label: string
  value: string | number
  suffix?: string
  icon: React.ReactNode
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {value}
            {suffix && <span className="text-base font-medium text-gray-500 ml-0.5">{suffix}</span>}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 shrink-0">
          {icon}
        </div>
      </div>
    </Card>
  )
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md text-sm">
      <p className="text-xs text-gray-500 mb-1.5">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="font-medium" style={{ color: entry.color }}>
          {entry.value.toLocaleString('es-ES')}{' '}
          <span className="font-normal text-gray-500 text-xs">{entry.name}</span>
        </p>
      ))}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
      <div className="h-72 rounded-xl bg-gray-100 animate-pulse" />
      <div className="h-48 rounded-xl bg-gray-100 animate-pulse" />
    </div>
  )
}

// ── Period Toggle ─────────────────────────────────────────────────────────────

const PERIODS: { value: Period; label: string }[] = [
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '90d', label: '90d' },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null)
  const [period, setPeriod] = useState<Period>('30d')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Step 1: load sites list once on mount
  useEffect(() => {
    api
      .get<{ data: Site[] }>('/sites?limit=100')
      .then(({ data: resp }) => {
        const list = resp.data ?? []
        setSites(list)
        if (list.length > 0) {
          setSelectedSiteId(list[0].id)
        } else {
          setIsLoading(false)
          setError('No tienes sitios creados aún. Crea un sitio para ver la analítica.')
        }
      })
      .catch((err) => {
        setIsLoading(false)
        setError(getApiErrorMessage(err, 'No se pudo cargar la lista de sitios.'))
      })
  }, [])

  // Step 2: load analytics whenever siteId or period changes
  const fetchAnalytics = useCallback(() => {
    if (!selectedSiteId) return
    setIsLoading(true)
    setData(null)
    setError(null)
    api
      .get<{ data: AnalyticsData }>(`/sites/${selectedSiteId}/analytics?period=${period}`)
      .then(({ data: resp }) => setData(resp.data))
      .catch((err) => setError(getApiErrorMessage(err, 'No se pudo cargar la analítica.')))
      .finally(() => setIsLoading(false))
  }, [selectedSiteId, period])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const chartData = data?.viewsByDay.map((d) => ({
    date: formatDate(d.date),
    views: d.views,
  })) ?? []

  const periodLabel =
    period === '7d' ? 'Últimos 7 días' :
    period === '30d' ? 'Últimos 30 días' :
    'Últimos 90 días'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Analítica</h2>
          <p className="text-sm text-gray-500 mt-0.5">{periodLabel}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Site selector — only shown when there are multiple sites */}
          {sites.length > 1 && (
            <select
              value={selectedSiteId ?? ''}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              aria-label="Seleccionar sitio"
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          )}

          {/* Period toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm" role="group" aria-label="Seleccionar período">
            {PERIODS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setPeriod(value)}
                className={`px-3 py-1.5 transition-colors ${period === value ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                aria-pressed={period === value}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {isLoading ? (
        <AnalyticsSkeleton />
      ) : !data ? null : (
        <>
          {/* Empty state */}
          {data.totalViews === 0 && (
            <div className="rounded-xl bg-amber-50 border border-amber-100 px-5 py-4 text-sm text-amber-800">
              Aún no registramos visitas. Asegúrate de que tu sitio esté publicado.
            </div>
          )}

          {/* Metric Cards */}
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              label="Visitas totales"
              value={formatNumber(data.totalViews)}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              }
            />
            <MetricCard
              label="Páginas únicas"
              value={formatNumber(data.uniquePaths)}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              }
            />
          </div>

          {/* Chart */}
          <Card className="p-5">
            <div className="mb-5">
              <h3 className="text-base font-semibold text-gray-900">Visitas por día</h3>
            </div>

            {chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-sm text-gray-400">No hay datos para mostrar.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => formatNumber(Number(v))}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="views"
                    name="visitas"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fill="url(#colorViews)"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0, fill: '#2563eb' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Top Pages */}
          {data.topPages.length > 0 && (
            <Card className="p-5">
              <h3 className="text-base font-semibold text-gray-900 mb-4">Top páginas</h3>
              <div className="space-y-3">
                {data.topPages.map((page) => (
                  <div key={page.path}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700 font-mono truncate max-w-[65%]" title={page.path}>
                        {page.path}
                      </span>
                      <span className="text-gray-500 shrink-0 ml-2">
                        {formatNumber(page.views)} visitas
                        <span className="text-gray-400 ml-1.5">({page.percentage.toFixed(1)}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary-500"
                        style={{ width: `${Math.min(page.percentage, 100)}%` }}
                        aria-label={`${page.percentage.toFixed(1)}% del total`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
