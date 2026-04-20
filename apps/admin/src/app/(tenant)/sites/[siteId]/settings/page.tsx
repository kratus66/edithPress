'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, Input, Alert, Card, Modal, ModalBody, ModalFooter } from '@edithpress/ui'
import { api, getApiErrorMessage } from '@/lib/api-client'

// ── Types ──────────────────────────────────────────────────────────────────────

type DomainStatus = 'NONE' | 'PENDING' | 'VERIFYING' | 'ACTIVE' | 'FAILED'

interface DomainInfo {
  domain: string
  status: DomainStatus
  txtRecord?: string
  verifiedAt?: string
}

// ── Schema de settings ────────────────────────────────────────────────────────

const settingsSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
  description: z.string().max(300, 'Máximo 300 caracteres').optional(),
  faviconUrl: z
    .string()
    .url('Ingresa una URL válida')
    .optional()
    .or(z.literal('')),
  seoTitle: z
    .string()
    .max(70, 'El título SEO debe tener menos de 70 caracteres')
    .optional(),
  seoDescription: z
    .string()
    .max(160, 'La descripción SEO debe tener menos de 160 caracteres')
    .optional(),
  seoImage: z
    .string()
    .url('Ingresa una URL válida para la imagen OG')
    .optional()
    .or(z.literal('')),
})

type SettingsValues = z.infer<typeof settingsSchema>

// Schema dominio
const domainSchema = z.object({
  domain: z
    .string()
    .min(1, 'El dominio es obligatorio')
    .regex(/^[^/\s]+\.[^/\s]+$/, 'Ingresa un dominio válido (ej: tu-dominio.com, sin http://)')
    .refine((v) => !v.startsWith('http'), { message: 'No incluyas http:// o https://' })
    .refine((v) => !v.includes(' '), { message: 'El dominio no puede contener espacios' }),
})

type DomainFormValues = z.infer<typeof domainSchema>

// ── CharCount ─────────────────────────────────────────────────────────────────

function CharCount({ value = '', max }: { value?: string; max: number }) {
  const remaining = max - (value?.length ?? 0)
  return (
    <span className={`text-xs ${remaining < 10 ? 'text-orange-500' : 'text-gray-400'}`}>
      {remaining} caracteres restantes
    </span>
  )
}

// ── Custom Domains Section ────────────────────────────────────────────────────

function CustomDomainSection({ siteId }: { siteId: string }) {
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [connectError, setConnectError] = useState<string | null>(null)
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [verifySuccess, setVerifySuccess] = useState(false)

  // TODO: conectar a API real GET /api/v1/sites/:siteId/domain
  const { data: domainInfo, isLoading: domainLoading } = useQuery<DomainInfo>({
    queryKey: ['domain', siteId],
    queryFn: async () => {
      const { data } = await api.get<{ data: DomainInfo }>(`/sites/${siteId}/domain`)
      return data.data
    },
    // Polling cada 30s cuando está PENDING o VERIFYING
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'PENDING' || status === 'VERIFYING' ? 30_000 : false
    },
    retry: false,
    // Mock inicial — NONE = sin dominio
    placeholderData: { domain: '', status: 'NONE' },
  })

  // Formulario para conectar dominio
  const {
    register: registerDomain,
    handleSubmit: handleDomainSubmit,
    formState: { errors: domainErrors, isSubmitting: domainSubmitting },
    reset: resetDomain,
  } = useForm<DomainFormValues>({
    resolver: zodResolver(domainSchema),
    defaultValues: { domain: '' },
  })

  // Conectar dominio
  async function onConnectDomain(values: DomainFormValues) {
    setConnectError(null)
    try {
      // TODO: conectar a API real POST /api/v1/sites/:siteId/domain
      await api.post(`/sites/${siteId}/domain`, { domain: values.domain })
      queryClient.invalidateQueries({ queryKey: ['domain', siteId] })
      resetDomain()
    } catch (err) {
      setConnectError(getApiErrorMessage(err, 'No se pudo conectar el dominio.'))
    }
  }

  // Verificar dominio
  const verifyMutation = useMutation({
    mutationFn: async () => {
      // TODO: conectar a API real POST /api/v1/sites/:siteId/domain/verify
      await api.post(`/sites/${siteId}/domain/verify`)
    },
    onSuccess: () => {
      setVerifySuccess(true)
      setVerifyError(null)
      queryClient.invalidateQueries({ queryKey: ['domain', siteId] })
    },
    onError: (err) => {
      setVerifyError(getApiErrorMessage(err, 'No se pudo verificar el dominio.'))
    },
  })

  // Eliminar dominio
  const deleteMutation = useMutation({
    mutationFn: async () => {
      // TODO: conectar a API real DELETE /api/v1/sites/:siteId/domain
      await api.delete(`/sites/${siteId}/domain`)
    },
    onSuccess: () => {
      setShowDeleteModal(false)
      queryClient.invalidateQueries({ queryKey: ['domain', siteId] })
    },
    onError: (err) => {
      setVerifyError(getApiErrorMessage(err, 'No se pudo eliminar el dominio.'))
      setShowDeleteModal(false)
    },
  })

  async function copyTxtRecord() {
    if (!domainInfo?.txtRecord) return
    try {
      await navigator.clipboard.writeText(domainInfo.txtRecord)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: seleccionar el texto
    }
  }

  if (domainLoading) {
    return <div className="h-32 rounded-lg bg-gray-100 animate-pulse" />
  }

  const status = domainInfo?.status ?? 'NONE'

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-base font-semibold text-gray-900">Dominio personalizado</h3>

      {/* Estado: SIN DOMINIO */}
      {status === 'NONE' && (
        <form onSubmit={handleDomainSubmit(onConnectDomain)} className="space-y-3" noValidate>
          {connectError && <Alert variant="error" onDismiss={() => setConnectError(null)}>{connectError}</Alert>}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="tu-dominio.com"
                aria-label="Dominio personalizado"
                error={domainErrors.domain?.message}
                {...registerDomain('domain')}
              />
            </div>
            <Button type="submit" loading={domainSubmitting}>
              Conectar dominio
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Ingresa tu dominio sin http:// (ej: <span className="font-mono">miempresa.com</span>)
          </p>
        </form>
      )}

      {/* Estado: PENDING o VERIFYING */}
      {(status === 'PENDING' || status === 'VERIFYING') && (
        <div className="space-y-4">
          {verifyError && <Alert variant="error" onDismiss={() => setVerifyError(null)}>{verifyError}</Alert>}
          {verifySuccess && <Alert variant="success" onDismiss={() => setVerifySuccess(false)}>Verificacion iniciada. Comprueba el estado en unos minutos.</Alert>}

          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" aria-hidden="true" />
            <span className="text-sm font-medium text-yellow-700">Pendiente de verificacion DNS</span>
          </div>

          <p className="text-sm text-gray-600">
            Dominio: <span className="font-medium">{domainInfo?.domain}</span>
          </p>

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 space-y-3">
            <p className="text-sm font-medium text-gray-800">Agrega el siguiente registro DNS en tu proveedor:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-yellow-200">
                    <th className="text-left py-1.5 pr-4 text-xs font-semibold text-gray-600">Tipo</th>
                    <th className="text-left py-1.5 pr-4 text-xs font-semibold text-gray-600">Nombre</th>
                    <th className="text-left py-1.5 text-xs font-semibold text-gray-600">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-1.5 pr-4 font-mono text-xs text-gray-700">TXT</td>
                    <td className="py-1.5 pr-4 font-mono text-xs text-gray-700 break-all">
                      _edithpress-verify.{domainInfo?.domain}
                    </td>
                    <td className="py-1.5 font-mono text-xs text-gray-700 break-all">
                      {domainInfo?.txtRecord ?? 'edithpress-verify=...'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyTxtRecord}
            >
              {copied ? 'Copiado!' : 'Copiar valor'}
            </Button>
          </div>

          <p className="text-xs text-gray-500">
            Los cambios de DNS pueden tardar hasta 48 horas en propagarse. Verificamos automaticamente cada 30 segundos.
          </p>

          <Button
            type="button"
            variant="outline"
            onClick={() => verifyMutation.mutate()}
            loading={verifyMutation.isPending}
          >
            Verificar ahora
          </Button>
        </div>
      )}

      {/* Estado: ACTIVE */}
      {status === 'ACTIVE' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500" aria-hidden="true">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="text-sm font-medium text-green-700">Dominio activo</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`https://${domainInfo?.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary-600 hover:underline underline-offset-4"
            >
              {domainInfo?.domain} &rarr;
            </a>
          </div>

          {domainInfo?.verifiedAt && (
            <p className="text-xs text-gray-400">
              Verificado el{' '}
              {new Date(domainInfo.verifiedAt).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
          >
            Eliminar dominio
          </Button>
        </div>
      )}

      {/* Estado: FAILED */}
      {status === 'FAILED' && (
        <div className="space-y-4">
          {verifyError && <Alert variant="error" onDismiss={() => setVerifyError(null)}>{verifyError}</Alert>}

          <Alert variant="error">
            No se encontro el registro DNS para{' '}
            <span className="font-medium">{domainInfo?.domain}</span>.
            Asegurate de haber agregado correctamente el registro TXT y espera a que se propague (puede tardar hasta 48 horas).
          </Alert>

          <div className="space-y-1 text-sm text-gray-600">
            <p className="font-medium">Pasos para resolver:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-500">
              <li>Accede al panel de tu proveedor de dominio (GoDaddy, Namecheap, etc.)</li>
              <li>Busca la seccion de gestion de DNS o zona DNS</li>
              <li>Agrega un registro <span className="font-mono font-medium">TXT</span> con el valor indicado</li>
              <li>Guarda los cambios y espera la propagacion</li>
            </ol>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => verifyMutation.mutate()}
            loading={verifyMutation.isPending}
          >
            Reintentar verificacion
          </Button>
        </div>
      )}

      {/* Modal de confirmacion de eliminacion */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Eliminar dominio personalizado"
      >
        <ModalBody>
          <p className="text-sm text-gray-600">
            Esta accion eliminara el dominio{' '}
            <span className="font-medium">{domainInfo?.domain}</span> de tu sitio.
            Tu sitio seguira accesible desde el subdominio de EdithPress.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteMutation.mutate()}
            loading={deleteMutation.isPending}
          >
            Eliminar dominio
          </Button>
        </ModalFooter>
      </Modal>
    </Card>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SiteSettingsPage({
  params,
}: {
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = use(params)

  const [success, setSuccess] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: '',
      description: '',
      faviconUrl: '',
      seoTitle: '',
      seoDescription: '',
      seoImage: '',
    },
  })

  const watchedDesc = watch('description')
  const watchedSeoTitle = watch('seoTitle')
  const watchedSeoDesc = watch('seoDescription')

  // Cargar configuracion existente
  useEffect(() => {
    api
      .get<{
        data: {
          name: string
          description?: string
          settings?: {
            faviconUrl?: string
            seoTitle?: string
            seoDescription?: string
            seoImage?: string
          }
        }
      }>(`/sites/${siteId}`)
      .then(({ data }) => {
        reset({
          name: data.data.name,
          description: data.data.description ?? '',
          faviconUrl: data.data.settings?.faviconUrl ?? '',
          seoTitle: data.data.settings?.seoTitle ?? '',
          seoDescription: data.data.settings?.seoDescription ?? '',
          seoImage: data.data.settings?.seoImage ?? '',
        })
      })
      .catch(() => {})
  }, [siteId, reset])

  async function onSubmit(values: SettingsValues) {
    setApiError(null)
    setSuccess(false)
    try {
      await api.patch(`/sites/${siteId}`, {
        name: values.name,
        description: values.description,
        settings: {
          faviconUrl: values.faviconUrl || null,
          seoTitle: values.seoTitle || null,
          seoDescription: values.seoDescription || null,
          seoImage: values.seoImage || null,
        },
      })
      setSuccess(true)
    } catch (err) {
      setApiError(getApiErrorMessage(err, 'No se pudo guardar la configuracion.'))
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/sites/${siteId}`}>
          <button
            type="button"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-md"
            aria-label="Volver al sitio"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Sitio
          </button>
        </Link>
        <h2 className="flex-1 text-xl font-semibold text-gray-900">Configuracion del sitio</h2>
      </div>

      {/* Nav tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <Link
          href={`/sites/${siteId}/settings`}
          className="border-b-2 border-primary-600 px-4 py-2 text-sm font-medium text-primary-600"
        >
          General &amp; SEO
        </Link>
        <Link
          href={`/sites/${siteId}/analytics`}
          className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Analitica
        </Link>
      </div>

      {success && (
        <Alert variant="success" onDismiss={() => setSuccess(false)}>
          Configuracion guardada correctamente.
        </Alert>
      )}
      {apiError && (
        <Alert variant="error" onDismiss={() => setApiError(null)}>
          {apiError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* General */}
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-semibold text-gray-900">General</h3>

          <Input
            label="Nombre del sitio"
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="space-y-1">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Descripcion
            </label>
            <textarea
              id="description"
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent resize-none"
              placeholder="Breve descripcion de tu sitio..."
              {...register('description')}
            />
            <div className="flex justify-between">
              {errors.description ? (
                <p className="text-xs text-red-600">{errors.description.message}</p>
              ) : (
                <span />
              )}
              <CharCount value={watchedDesc} max={300} />
            </div>
          </div>

          <Input
            label="URL del favicon"
            type="url"
            placeholder="https://ejemplo.com/favicon.ico"
            error={errors.faviconUrl?.message}
            {...register('faviconUrl')}
          />
        </Card>

        {/* SEO */}
        <Card className="p-6 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">SEO global</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Estos valores se usan en las paginas que no tienen SEO propio configurado.
            </p>
          </div>

          <div className="space-y-1">
            <Input
              label="Titulo (og:title)"
              placeholder="Mi empresa - Sitio oficial"
              error={errors.seoTitle?.message}
              {...register('seoTitle')}
            />
            <CharCount value={watchedSeoTitle} max={70} />
          </div>

          <div className="space-y-1">
            <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700">
              Descripcion (og:description / meta description)
            </label>
            <textarea
              id="seoDescription"
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent resize-none"
              placeholder="Descripcion breve para buscadores y redes sociales..."
              {...register('seoDescription')}
            />
            <div className="flex justify-between">
              {errors.seoDescription ? (
                <p className="text-xs text-red-600">{errors.seoDescription.message}</p>
              ) : (
                <span />
              )}
              <CharCount value={watchedSeoDesc} max={160} />
            </div>
          </div>

          <Input
            label="Imagen OG (og:image)"
            type="url"
            placeholder="https://ejemplo.com/og-image.jpg"
            error={errors.seoImage?.message}
            {...register('seoImage')}
          />
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={!isDirty}
          >
            Guardar configuracion
          </Button>
        </div>
      </form>

      {/* Dominio personalizado */}
      <CustomDomainSection siteId={siteId} />
    </div>
  )
}
