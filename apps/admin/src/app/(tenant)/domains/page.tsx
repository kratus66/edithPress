'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Badge, Card, Alert } from '@edithpress/ui'
import { api, getApiErrorMessage } from '@/lib/api-client'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Site {
  id: string
  name: string
}

type DomainStatus = 'NONE' | 'PENDING' | 'VERIFYING' | 'ACTIVE' | 'FAILED'

interface DomainInfo {
  domain: string
  status: DomainStatus
}

interface SiteWithDomain extends Site {
  domainInfo: DomainInfo | null
  domainLoading: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTenantIdFromCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]+)/)
  if (!match) return null
  try {
    const base64 = decodeURIComponent(match[1]).split('.')[1]
    const payload = JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')))
    return (payload?.tenantId as string | null) ?? null
  } catch {
    return null
  }
}

const DOMAIN_STATUS_LABELS: Record<DomainStatus, string> = {
  NONE: 'Sin dominio',
  PENDING: 'Pendiente',
  VERIFYING: 'Verificando',
  ACTIVE: 'Activo',
  FAILED: 'Error',
}

const DOMAIN_STATUS_VARIANTS: Record<DomainStatus, 'default' | 'warning' | 'success' | 'error'> = {
  NONE: 'default',
  PENDING: 'warning',
  VERIFYING: 'warning',
  ACTIVE: 'success',
  FAILED: 'error',
}

// ── Site Domain Row ───────────────────────────────────────────────────────────

function SiteDomainRow({ site }: { site: SiteWithDomain }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{site.name}</p>
        {site.domainInfo?.status === 'ACTIVE' && (
          <p className="text-xs text-gray-500 truncate">{site.domainInfo.domain}</p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {site.domainLoading ? (
          <div className="h-5 w-16 rounded-full bg-gray-100 animate-pulse" />
        ) : (
          <Badge variant={DOMAIN_STATUS_VARIANTS[site.domainInfo?.status ?? 'NONE']}>
            {DOMAIN_STATUS_LABELS[site.domainInfo?.status ?? 'NONE']}
          </Badge>
        )}
        <Link
          href={`/sites/${site.id}/settings`}
          className="text-xs text-primary-600 hover:text-primary-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
        >
          Gestionar →
        </Link>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DomainsPage() {
  const [sites, setSites] = useState<SiteWithDomain[]>([])
  const [tenantSlug, setTenantSlug] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDomains = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch tenant slug and sites in parallel
      const tenantId = getTenantIdFromCookie()
      const [sitesRes, tenantRes] = await Promise.all([
        api.get<{ data: Site[] }>('/sites?limit=100'),
        tenantId
          ? api.get<{ data: { slug: string } }>(`/tenants/${tenantId}`).catch(() => null)
          : Promise.resolve(null),
      ])
      setTenantSlug(tenantRes?.data?.data?.slug ?? null)

      const siteList: Site[] = sitesRes.data.data

      // Seed state with sites (domains loading)
      setSites(siteList.map((s) => ({ ...s, domainInfo: null, domainLoading: true })))
      setIsLoading(false)

      // Fetch domain info per site in parallel
      const domainResults = await Promise.allSettled(
        siteList.map((s) =>
          api
            .get<{ data: DomainInfo }>(`/sites/${s.id}/domain`)
            .then((r) => ({ siteId: s.id, domain: r.data.data })),
        ),
      )

      setSites(
        siteList.map((s, i) => {
          const result = domainResults[i]
          return {
            ...s,
            domainInfo: result.status === 'fulfilled' ? result.value.domain : null,
            domainLoading: false,
          }
        }),
      )
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudieron cargar los sitios.'))
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { void loadDomains() }, [loadDomains])

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Dominios</h2>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Subdominio del tenant */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Tu subdominio de EdithPress</h3>
        {isLoading ? (
          <div className="h-8 w-64 rounded bg-gray-100 animate-pulse" />
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-200 px-4 py-2.5">
              <span className="text-sm font-mono text-gray-900">
                {tenantSlug ? `${tenantSlug}.edithpress.com` : '…'}
              </span>
              <Badge variant="success">Activo</Badge>
            </div>
            {tenantSlug && (
              <a
                href={`https://${tenantSlug}.edithpress.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
              >
                Abrir →
              </a>
            )}
          </div>
        )}
      </Card>

      {/* Dominios personalizados por sitio */}
      <Card className="p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Dominios personalizados</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Los dominios se configuran en los ajustes de cada sitio.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : sites.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-500">Aún no tienes sitios.</p>
            <Link href="/sites/new" className="text-xs text-primary-600 hover:underline mt-1 inline-block">
              Crear tu primer sitio →
            </Link>
          </div>
        ) : (
          <div>
            {sites.map((site) => (
              <SiteDomainRow key={site.id} site={site} />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
