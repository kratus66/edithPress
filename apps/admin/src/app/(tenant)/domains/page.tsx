'use client'

import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Alert, Card, Badge } from '@edithpress/ui'
import { api, getApiErrorMessage } from '@/lib/api-client'

// ── Types ─────────────────────────────────────────────────────────────────────

type DomainStatus = 'PENDING' | 'VERIFIED' | 'ERROR'

interface CustomDomain {
  id: string
  domain: string
  status: DomainStatus
  verifiedAt: string | null
  createdAt: string
}

interface TenantDomainInfo {
  subdomain: string        // ej: "mi-empresa"
  customDomains: CustomDomain[]
}

// ── Schema ────────────────────────────────────────────────────────────────────

const addDomainSchema = z.object({
  domain: z
    .string()
    .min(1, 'El dominio es obligatorio')
    .regex(
      /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
      'Ingresa un dominio válido (ej: miempresa.com)',
    ),
})

type AddDomainValues = z.infer<typeof addDomainSchema>

// ── Status Badge ──────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<DomainStatus, string> = {
  PENDING: 'Pendiente',
  VERIFIED: 'Verificado',
  ERROR: 'Error',
}

const STATUS_VARIANTS: Record<DomainStatus, 'warning' | 'success' | 'destructive'> = {
  PENDING: 'warning',
  VERIFIED: 'success',
  ERROR: 'destructive',
}

// ── DNS Instructions ──────────────────────────────────────────────────────────

function DnsInstructions({ domain }: { domain: string }) {
  const [copied, setCopied] = useState<string | null>(null)

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const records = [
    {
      key: 'a-record',
      type: 'A',
      host: '@',
      value: '76.76.21.21',
      description: 'Para el dominio raíz (ejemplo.com)',
    },
    {
      key: 'cname-www',
      type: 'CNAME',
      host: 'www',
      value: 'cname.edithpress.com',
      description: 'Para www.ejemplo.com',
    },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-1">
          Configura los registros DNS
        </h4>
        <p className="text-xs text-gray-500">
          En el panel de tu proveedor de dominio (GoDaddy, Namecheap, Cloudflare, etc.), agrega
          los siguientes registros para <strong>{domain}</strong>:
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Tipo', 'Host', 'Valor', ''].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.map((rec) => (
              <tr key={rec.key} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="font-mono text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                    {rec.type}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-700">{rec.host}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-700 break-all">{rec.value}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => copy(rec.value, rec.key)}
                    className="text-xs text-primary-600 hover:text-primary-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
                    aria-label={`Copiar valor del registro ${rec.type}`}
                  >
                    {copied === rec.key ? 'Copiado' : 'Copiar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">
        Los cambios DNS pueden tardar hasta 48 horas en propagarse. Una vez configurados, haz clic
        en "Verificar" para comprobar el estado.
      </p>
    </div>
  )
}

// ── Domain Row ────────────────────────────────────────────────────────────────

function DomainRow({
  domain,
  onVerify,
  onRemove,
}: {
  domain: CustomDomain
  onVerify: (id: string) => Promise<void>
  onRemove: (id: string) => Promise<void>
}) {
  const [verifying, setVerifying] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [showDns, setShowDns] = useState(domain.status === 'PENDING')

  async function handleVerify() {
    setVerifying(true)
    try {
      await onVerify(domain.id)
    } finally {
      setVerifying(false)
    }
  }

  async function handleRemove() {
    setRemoving(true)
    try {
      await onRemove(domain.id)
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Domain info */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 shrink-0" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <div className="min-w-0">
            <p className="font-medium text-gray-900 text-sm truncate">{domain.domain}</p>
            {domain.verifiedAt && (
              <p className="text-xs text-gray-400">
                Verificado el {new Date(domain.verifiedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        {/* Status + actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={STATUS_VARIANTS[domain.status]}>
            {STATUS_LABELS[domain.status]}
          </Badge>

          {domain.status !== 'VERIFIED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleVerify}
              loading={verifying}
            >
              Verificar
            </Button>
          )}

          <button
            type="button"
            onClick={() => setShowDns((v) => !v)}
            className="text-xs text-gray-500 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded px-1"
            aria-expanded={showDns}
            aria-label={showDns ? 'Ocultar instrucciones DNS' : 'Ver instrucciones DNS'}
          >
            {showDns ? 'Ocultar DNS' : 'Ver DNS'}
          </button>

          {!confirmRemove ? (
            <button
              type="button"
              onClick={() => setConfirmRemove(true)}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              aria-label={`Eliminar dominio ${domain.domain}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" /><path d="M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button variant="destructive" size="sm" onClick={handleRemove} loading={removing}>
                Eliminar
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmRemove(false)} disabled={removing}>
                Cancelar
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* DNS instructions */}
      {showDns && (
        <div className="ml-6 pl-4 border-l-2 border-gray-100">
          <DnsInstructions domain={domain.domain} />
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DomainsPage() {
  const [info, setInfo] = useState<TenantDomainInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddDomainValues>({
    resolver: zodResolver(addDomainSchema),
  })

  const fetchDomains = useCallback(async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const { data } = await api.get<{ data: TenantDomainInfo }>('/tenants/me/domains')
      setInfo(data.data)
    } catch (err) {
      setFetchError(getApiErrorMessage(err, 'No se pudieron cargar los dominios.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { void fetchDomains() }, [fetchDomains])

  async function onAddDomain(values: AddDomainValues) {
    setActionError(null)
    try {
      const { data } = await api.post<{ data: CustomDomain }>('/tenants/me/domains', {
        domain: values.domain,
      })
      setInfo((prev) =>
        prev
          ? { ...prev, customDomains: [...prev.customDomains, data.data] }
          : prev,
      )
      reset()
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'No se pudo agregar el dominio.'))
    }
  }

  async function handleVerify(id: string) {
    setActionError(null)
    try {
      const { data } = await api.post<{ data: CustomDomain }>(`/tenants/me/domains/${id}/verify`)
      setInfo((prev) =>
        prev
          ? {
              ...prev,
              customDomains: prev.customDomains.map((d) =>
                d.id === id ? data.data : d,
              ),
            }
          : prev,
      )
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'La verificación falló. Revisa que los registros DNS estén bien configurados.'))
    }
  }

  async function handleRemove(id: string) {
    setActionError(null)
    try {
      await api.delete(`/tenants/me/domains/${id}`)
      setInfo((prev) =>
        prev
          ? { ...prev, customDomains: prev.customDomains.filter((d) => d.id !== id) }
          : prev,
      )
    } catch (err) {
      setActionError(getApiErrorMessage(err, 'No se pudo eliminar el dominio.'))
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Dominios</h2>

      {fetchError && <Alert variant="error">{fetchError}</Alert>}
      {actionError && (
        <Alert variant="error" onDismiss={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}

      {/* Subdominio actual */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Tu subdominio de EdithPress</h3>
        {isLoading ? (
          <div className="h-8 w-64 rounded bg-gray-100 animate-pulse" />
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 border border-gray-200 px-4 py-2.5">
              <span className="text-sm font-mono text-gray-900">
                {info?.subdomain}.edithpress.com
              </span>
              <Badge variant="success">Activo</Badge>
            </div>
            <a
              href={`https://${info?.subdomain}.edithpress.com`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded"
            >
              Abrir →
            </a>
          </div>
        )}
      </Card>

      {/* Agregar dominio custom */}
      <Card className="p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Agregar dominio personalizado</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Conecta tu propio dominio para que tu sitio sea accesible en él.
          </p>
        </div>

        <form onSubmit={handleSubmit(onAddDomain)} className="flex gap-2" noValidate>
          <div className="flex-1">
            <Input
              placeholder="miempresa.com"
              error={errors.domain?.message}
              aria-label="Dominio personalizado"
              {...register('domain')}
            />
          </div>
          <Button type="submit" loading={isSubmitting} className="shrink-0">
            Agregar
          </Button>
        </form>
      </Card>

      {/* Lista de dominios custom */}
      {!isLoading && info && info.customDomains.length > 0 && (
        <Card className="p-5 space-y-5">
          <h3 className="text-sm font-semibold text-gray-700">Dominios configurados</h3>
          <div className="space-y-5 divide-y divide-gray-100">
            {info.customDomains.map((domain, idx) => (
              <div key={domain.id} className={idx > 0 ? 'pt-5' : ''}>
                <DomainRow
                  domain={domain}
                  onVerify={handleVerify}
                  onRemove={handleRemove}
                />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
