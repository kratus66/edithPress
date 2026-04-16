'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Button, Badge, Alert } from '@edithpress/ui'
import { api, getApiErrorMessage } from '@/lib/api-client'

interface Tenant {
  id: string; name: string; slug: string; planName: string
  isActive: boolean; sitesCount: number; createdAt: string
}

interface TenantsResponse {
  data: Tenant[]
  meta: { page: number; limit: number; total: number }
}

export default function SuperAdminTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Debounce de búsqueda
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const fetchTenants = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (debouncedSearch) params.set('search', debouncedSearch)
      const { data } = await api.get<TenantsResponse>(`/admin/tenants?${params}`)
      setTenants(data.data)
      setTotal(data.meta.total)
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudieron cargar los tenants.'))
    } finally {
      setIsLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => { void fetchTenants() }, [fetchTenants])

  async function handleToggleActive(id: string, isActive: boolean) {
    try {
      await api.patch(`/admin/tenants/${id}`, { isActive: !isActive })
      setTenants((prev) => prev.map((t) => t.id === id ? { ...t, isActive: !isActive } : t))
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo actualizar el tenant.'))
    }
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Tenants <span className="text-gray-400 font-normal text-base">({total})</span></h1>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Búsqueda */}
      <div className="relative">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          placeholder="Buscar por nombre o slug..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-full rounded-lg border border-white/10 bg-gray-900 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 max-w-sm"
          aria-label="Buscar tenants"
        />
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 border-b border-white/10">
            <tr>
              {['Tenant', 'Plan', 'Sitios', 'Registrado', 'Estado', 'Acciones'].map((col) => (
                <th key={col} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-gray-950">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 rounded bg-gray-800 animate-pulse w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : tenants.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                  No se encontraron tenants.
                </td>
              </tr>
            ) : tenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{tenant.name}</p>
                  <p className="text-xs text-gray-500">{tenant.slug}.edithpress.com</p>
                </td>
                <td className="px-4 py-3 text-gray-300">{tenant.planName}</td>
                <td className="px-4 py-3 text-gray-300">{tenant.sitesCount}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(tenant.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={tenant.isActive ? 'success' : 'destructive'}>
                    {tenant.isActive ? 'Activo' : 'Suspendido'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/super-admin/tenants/${tenant.id}`}>
                      <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-white/10">
                        Ver
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={tenant.isActive
                        ? 'text-orange-400 hover:bg-orange-500/10'
                        : 'text-green-400 hover:bg-green-500/10'}
                      onClick={() => handleToggleActive(tenant.id, tenant.isActive)}
                    >
                      {tenant.isActive ? 'Suspender' : 'Activar'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>Mostrando {((page - 1) * 20) + 1}–{Math.min(page * 20, total)} de {total}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="border-white/10 text-gray-300">
              ← Anterior
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="border-white/10 text-gray-300">
              Siguiente →
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
