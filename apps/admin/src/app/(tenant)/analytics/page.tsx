'use client'

import { useEffect, useState } from 'react'
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

interface DailyVisit {
  date: string   // "2026-03-17"
  visits: number
  pageViews: number
}

interface AnalyticsSummary {
  visits30d: number
  pageViews30d: number
  uniqueVisitors30d: number
  bounceRate: number       // porcentaje 0–100
  dailyData: DailyVisit[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
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
  trend,
}: {
  label: string
  value: string | number
  suffix?: string
  icon: React.ReactNode
  trend?: { value: number; label: string }
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
          {trend && (
            <p className={`mt-1 text-xs font-medium ${trend.value >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
            </p>
          )}
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
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
      <div className="h-72 rounded-xl bg-gray-100 animate-pulse" />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [series, setSeries] = useState<'visits' | 'pageViews'>('visits')

  useEffect(() => {
    setIsLoading(true)
    api
      .get<{ data: AnalyticsSummary }>('/tenants/me/analytics?period=30d')
      .then(({ data }) => setData(data.data))
      .catch((err) => setError(getApiErrorMessage(err, 'No se pudo cargar la analítica.')))
      .finally(() => setIsLoading(false))
  }, [])

  const chartData = data?.dailyData.map((d) => ({
    ...d,
    date: formatDate(d.date),
  })) ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Analítica</h2>
        <p className="text-sm text-gray-500 mt-0.5">Últimos 30 días</p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {isLoading ? (
        <AnalyticsSkeleton />
      ) : !data ? null : (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <MetricCard
              label="Visitas"
              value={formatNumber(data.visits30d)}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              }
            />
            <MetricCard
              label="Páginas vistas"
              value={formatNumber(data.pageViews30d)}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              }
            />
            <MetricCard
              label="Visitantes únicos"
              value={formatNumber(data.uniqueVisitors30d)}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
            />
            <MetricCard
              label="Tasa de rebote"
              value={data.bounceRate.toFixed(1)}
              suffix="%"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="17 1 21 5 17 9" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <polyline points="7 23 3 19 7 15" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
              }
            />
          </div>

          {/* Chart */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-gray-900">
                {series === 'visits' ? 'Visitas' : 'Páginas vistas'} por día
              </h3>

              {/* Series toggle */}
              <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm" role="group" aria-label="Seleccionar serie">
                <button
                  type="button"
                  onClick={() => setSeries('visits')}
                  className={`px-3 py-1.5 transition-colors ${series === 'visits' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  aria-pressed={series === 'visits'}
                >
                  Visitas
                </button>
                <button
                  type="button"
                  onClick={() => setSeries('pageViews')}
                  className={`px-3 py-1.5 transition-colors ${series === 'pageViews' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  aria-pressed={series === 'pageViews'}
                >
                  Páginas vistas
                </button>
              </div>
            </div>

            {chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <p className="text-sm text-gray-400">No hay datos para mostrar.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
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
                    dataKey={series}
                    name={series === 'visits' ? 'visitas' : 'páginas vistas'}
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#colorVisits)"
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Empty state hint */}
          {data.visits30d === 0 && (
            <div className="rounded-xl bg-amber-50 border border-amber-100 px-5 py-4 text-sm text-amber-800">
              Aún no registramos visitas. Asegúrate de que tu sitio esté publicado y el script
              de analítica esté instalado.
            </div>
          )}
        </>
      )}
    </div>
  )
}
