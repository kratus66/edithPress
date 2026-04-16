'use client'

import { useState, useEffect, useCallback } from 'react'
import { api, getApiErrorMessage } from '@/lib/api-client'

export interface Site {
  id: string
  tenantId: string
  name: string
  description?: string
  favicon?: string
  isPublished: boolean
  templateId?: string
  settings: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

interface SitesResponse {
  data: Site[]
  meta: { page: number; limit: number; total: number }
}

export function useSites() {
  const [sites, setSites] = useState<Site[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSites = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await api.get<SitesResponse>('/sites')
      setSites(data.data)
      setTotal(data.meta.total)
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudieron cargar los sitios.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { void fetchSites() }, [fetchSites])

  async function deleteSite(siteId: string) {
    await api.delete(`/sites/${siteId}`)
    setSites((prev) => prev.filter((s) => s.id !== siteId))
    setTotal((t) => t - 1)
  }

  async function publishSite(siteId: string) {
    const { data } = await api.post<{ data: Site }>(`/sites/${siteId}/publish`)
    setSites((prev) => prev.map((s) => (s.id === siteId ? data.data : s)))
  }

  return { sites, total, isLoading, error, refetch: fetchSites, deleteSite, publishSite }
}

export function useSite(siteId: string) {
  const [site, setSite] = useState<Site | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!siteId) return
    setIsLoading(true)
    api.get<{ data: Site }>(`/sites/${siteId}`)
      .then(({ data }) => setSite(data.data))
      .catch((err) => setError(getApiErrorMessage(err, 'No se pudo cargar el sitio.')))
      .finally(() => setIsLoading(false))
  }, [siteId])

  return { site, isLoading, error }
}
