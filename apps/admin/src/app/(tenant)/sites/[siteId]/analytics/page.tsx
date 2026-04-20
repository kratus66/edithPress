'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Card, Alert } from '@edithpress/ui'
import { api } from '@/lib/api-client'

// ── Types ──────────────────────────────────────────────────────────────────────

type Period = '7d' | '30d' | '90d'

interface TopPage {
  path: string
  count: number
}

interface DayView {
  date: string
  count: number
}

interface Referrer {
  referrer: string | null
  count: number
}

interface AnalyticsData {
  totalViews: number
  uniquePaths: number
  topPages: TopPage[]
  viewsByDay: DayView[]
  referrers: Referrer[]
}

// ── Period selector ───────────────────────────────────────────────────────────

const PERIODS: { value: Period; label: string }[] = [
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '90d', label: '90 dias' },
]

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`rounded bg-gray-100 animate-pulse ${className ?? ''}`} />
}

// ── Summary cards ─────────────────────────────────────────────────────────────

function SummaryCards({
  totalViews,
  uniquePaths,
  isLoading,
}: {
  totalViews: number
  uniquePaths: number
  isLoading: boolean
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="p-5">
        <p className="text-sm text-gray-500">Total de visitas</p>
        {isLoading ? (
          <Skeleton className="mt-2 h-8 w-24" />
        ) : (
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {totalViews.toLocaleString('es-ES')}
          </p>
        )}
      </Card>
      <Card className="p-5">
        <p className="text-sm text-gray-500">Paginas unicas visitadas</p>
        {isLoading ? (
          <Skeleton className="mt-2 h-8 w-16" />
        ) : (
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {uniquePaths.toLocaleString('es-ES')}
          </p>
        )}
      </Card>
    </div>
  )
}

// ── CSS bar chart ─────────────────────────────────────────────────────────────

function BarChart({
  data,
  isLoading,
  period,
}: {
  data: DayView[]
  isLoading: boolean
  period: Period
}) {
  if (isLoading) {
    return (
      <div className="flex items-end gap-1 h-40">
        {Array.from({ length: period === '7d' ? 7 : period === '30d' ? 30 : 20 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-gray-100 animate-pulse"
            style={{ height: `${Math.random() * 60 + 20}%` }}
          />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-gray-400">
        Sin datos para el periodo seleccionado.
      </div>
    )
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1)

  // For 90d, only show every 7th label to avoid overcrowding
  const labelInterval = period === '90d' ? 7 : period === '30d' ? 5 : 1

  return (
    <div
      className="space-y-2"
      aria-label="Grafico de barras: visitas por dia"
      role="img"
    >
      <div className="flex items-end gap-0.5 h-40">
        {data.map((d, i) => {
          const heightPct = (d.count / maxCount) * 100
          return (
            <div
              key={d.date}
              className="group relative flex-1 flex flex-col items-center justify-end"
              style={{ minWidth: 0 }}
            >
              {/* Tooltip on hover */}
              <div
                className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-10 hidden group-hover:flex flex-col items-center pointer-events-none"
                aria-hidden="true"
              >
                <div className="rounded bg-gray-900 px-2 py-1 text-xs text-white whitespace-nowrap shadow">
                  <span className="font-medium">{d.count.toLocaleString('es-ES')} visitas</span>
                  <br />
                  <span className="text-gray-300">
                    {new Date(d.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <div className="h-1.5 w-1.5 rotate-45 bg-gray-900 -mt-[3px]" />
              </div>

              <div
                className="w-full rounded-t-sm bg-indigo-500 hover:bg-indigo-400 transition-colors cursor-default"
                style={{ height: `${heightPct}%`, minHeight: '2px' }}
                aria-label={`${d.date}: ${d.count} visitas`}
              />

              {/* X-axis label */}
              {i % labelInterval === 0 && (
                <span
                  className="mt-1 text-[9px] text-gray-400 truncate w-full text-center"
                  aria-hidden="true"
                >
                  {new Date(d.date).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Top pages table ───────────────────────────────────────────────────────────

function TopPagesTable({
  pages,
  isLoading,
  totalViews,
}: {
  pages: TopPage[]
  isLoading: boolean
  totalViews: number
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (pages.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-4 text-center">
        Sin datos de paginas aun.
      </p>
    )
  }

  const max = Math.max(...pages.map((p) => p.count), 1)

  return (
    <div className="divide-y divide-gray-100">
      {pages.slice(0, 10).map((page) => {
        const pct = totalViews > 0 ? Math.round((page.count / totalViews) * 100) : 0
        const barPct = (page.count / max) * 100
        return (
          <div key={page.path} className="py-3 space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="font-mono text-xs text-gray-700 truncate">{page.path}</span>
              <span className="shrink-0 text-sm font-medium text-gray-900">
                {page.count.toLocaleString('es-ES')}
                <span className="ml-1 text-xs font-normal text-gray-400">({pct}%)</span>
              </span>
            </div>
            <div className="h-1 w-full rounded-full bg-gray-100">
              <div
                className="h-1 rounded-full bg-indigo-500"
                style={{ width: `${barPct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Referrers table ───────────────────────────────────────────────────────────

function ReferrersTable({
  referrers,
  isLoading,
}: {
  referrers: Referrer[]
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    )
  }

  if (referrers.length === 0) {
    return (
      <p className="text-sm text-gray-400 py-4 text-center">
        Sin datos de fuentes de trafico aun.
      </p>
    )
  }

  const max = Math.max(...referrers.map((r) => r.count), 1)

  return (
    <div className="divide-y divide-gray-100">
      {referrers.slice(0, 10).map((ref, idx) => {
        const label = ref.referrer || 'Directo'
        const barPct = (ref.count / max) * 100
        return (
          <div key={`${ref.referrer ?? 'direct'}-${idx}`} className="py-3 space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-700 truncate">{label}</span>
              <span className="shrink-0 text-sm font-medium text-gray-900">
                {ref.count.toLocaleString('es-ES')}
              </span>
            </div>
            <div className="h-1 w-full rounded-full bg-gray-100">
              <div
                className="h-1 rounded-full bg-violet-500"
                style={{ width: `${barPct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SiteAnalyticsPage({
  params,
}: {
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = use(params)
  const [period, setPeriod] = useState<Period>('30d')

  const { data: analytics, isLoading, isError } = useQuery<AnalyticsData>({
    queryKey: ['site-analytics', siteId, period],
    queryFn: async () => {
      const { data } = await api.get<{ data: AnalyticsData }>(
        `/sites/${siteId}/analytics?period=${period}`
      )
      return data.data
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const isEmpty =
    !isLoading &&
    !isError &&
    analytics &&
    analytics.totalViews === 0 &&
    analytics.viewsByDay.length === 0

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Link href={`/sites/${siteId}`}>
            <button
              type="button"
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-md"
              aria-label="Volver al sitio"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Sitio
            </button>
          </Link>
          <h2 className="text-xl font-semibold text-gray-900">Analitica</h2>
        </div>

        {/* Period selector */}
        <div
          className="flex rounded-lg border border-gray-200 overflow-hidden"
          role="group"
          aria-label="Seleccionar periodo"
        >
          {PERIODS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600 ${
                period === p.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              aria-pressed={period === p.value}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Nav tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <Link
          href={`/sites/${siteId}/settings`}
          className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          General &amp; SEO
        </Link>
        <Link
          href={`/sites/${siteId}/analytics`}
          className="border-b-2 border-primary-600 px-4 py-2 text-sm font-medium text-primary-600"
        >
          Analitica
        </Link>
      </div>

      {/* Error state */}
      {isError && (
        <Alert variant="error">
          No se pudieron cargar los datos de analitica. Intenta de nuevo mas tarde.
        </Alert>
      )}

      {/* Empty state */}
      {isEmpty && (
        <Card className="p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400"
              aria-hidden="true"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900">Sin datos aun</p>
          <p className="mt-1 text-sm text-gray-500">
            Las visitas apareceran aqui cuando tu sitio reciba trafico.
          </p>
        </Card>
      )}

      {/* Summary cards */}
      {!isEmpty && (
        <SummaryCards
          totalViews={analytics?.totalViews ?? 0}
          uniquePaths={analytics?.uniquePaths ?? 0}
          isLoading={isLoading}
        />
      )}

      {/* Views per day chart */}
      {!isEmpty && (
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-semibold text-gray-900">Visitas por dia</h3>
          <BarChart
            data={analytics?.viewsByDay ?? []}
            isLoading={isLoading}
            period={period}
          />
        </Card>
      )}

      {/* Tables */}
      {!isEmpty && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6 space-y-3">
            <h3 className="text-base font-semibold text-gray-900">Paginas mas visitadas</h3>
            <TopPagesTable
              pages={analytics?.topPages ?? []}
              isLoading={isLoading}
              totalViews={analytics?.totalViews ?? 0}
            />
          </Card>

          <Card className="p-6 space-y-3">
            <h3 className="text-base font-semibold text-gray-900">Fuentes de trafico</h3>
            <ReferrersTable
              referrers={analytics?.referrers ?? []}
              isLoading={isLoading}
            />
          </Card>
        </div>
      )}
    </div>
  )
}
