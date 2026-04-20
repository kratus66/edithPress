'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Button, Alert, Card } from '@edithpress/ui'
import { api, getApiErrorMessage } from '@/lib/api-client'

// ── Types ─────────────────────────────────────────────────────────────────────

interface MediaFile {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  createdAt: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImage(mimeType: string) {
  return mimeType.startsWith('image/')
}

// ── Media Card ────────────────────────────────────────────────────────────────

function MediaCard({
  file,
  onDeleted,
}: {
  file: MediaFile
  onDeleted: (id: string) => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      await api.delete(`/media/${file.id}`)
      onDeleted(file.id)
    } catch {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(file.url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="group relative rounded-xl border border-gray-200 overflow-hidden bg-white hover:shadow-md transition-shadow">
      {/* Preview */}
      <div className="aspect-video bg-gray-50 flex items-center justify-center overflow-hidden">
        {isImage(file.mimeType) ? (
          <Image
            src={file.url}
            alt={file.originalName}
            width={320}
            height={180}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-400">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="text-xs uppercase font-medium">{file.mimeType.split('/')[1]}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 truncate" title={file.originalName}>
          {file.originalName}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{formatBytes(file.size)}</p>
      </div>

      {/* Actions overlay */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-xs font-medium text-gray-800 hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          aria-label="Copiar URL"
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copiado
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copiar URL
            </>
          )}
        </button>

        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="p-1.5 rounded-lg bg-white text-red-500 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label={`Eliminar ${file.originalName}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" /><path d="M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </button>
        ) : (
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-2.5 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {deleting ? '...' : 'Eliminar'}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="px-2.5 py-1.5 rounded-lg bg-white text-gray-800 text-xs font-medium hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Uploader ──────────────────────────────────────────────────────────────────

function MediaUploader({ onUploaded }: { onUploaded: (file: MediaFile) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  async function uploadFile(file: File) {
    setUploading(true)
    setUploadError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const { data } = await api.post<{ data: MediaFile }>('/media', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onUploaded(data.data)
    } catch (err) {
      setUploadError(getApiErrorMessage(err, 'No se pudo subir el archivo.'))
    } finally {
      setUploading(false)
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    void uploadFile(files[0])
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={[
          'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-colors',
          dragOver
            ? 'border-primary-400 bg-primary-50'
            : 'border-gray-200 hover:border-gray-300 bg-gray-50',
        ].join(' ')}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 rounded-full border-2 border-primary-600 border-t-transparent animate-spin" aria-hidden="true" />
            <p className="text-sm text-gray-500">Subiendo...</p>
          </div>
        ) : (
          <>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400" aria-hidden="true">
              <polyline points="16 16 12 12 8 16" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
            <div className="text-center">
              <p className="text-sm text-gray-700 font-medium">Arrastra un archivo aquí</p>
              <p className="text-xs text-gray-400 mt-0.5">o haz clic para seleccionar</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              Seleccionar archivo
            </Button>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept="image/*,video/*,.pdf,.doc,.docx,.zip"
          onChange={(e) => handleFiles(e.target.files)}
          aria-label="Subir archivo"
        />
      </div>

      {uploadError && (
        <Alert variant="error" onDismiss={() => setUploadError(null)}>
          {uploadError}
        </Alert>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const PAGE_LIMIT = 24

type FilterTab = 'all' | 'images' | 'documents'

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'images', label: 'Imágenes' },
  { id: 'documents', label: 'Documentos' },
]

function matchesTab(file: MediaFile, tab: FilterTab): boolean {
  if (tab === 'all') return true
  if (tab === 'images') return file.mimeType.startsWith('image/')
  return !file.mimeType.startsWith('image/')
}

export default function MediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const gridRef = useRef<HTMLDivElement>(null)

  const totalPages = Math.ceil(total / PAGE_LIMIT)

  const fetchMedia = useCallback(async (currentPage: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await api.get<{ data: MediaFile[]; total: number }>(
        `/media?page=${currentPage}&limit=${PAGE_LIMIT}`,
      )
      setFiles(data.data)
      setTotal(data.total)
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo cargar la biblioteca de medios.'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { void fetchMedia(page) }, [fetchMedia, page])

  function handleUploaded(file: MediaFile) {
    setFiles((prev) => [file, ...prev])
    setTotal((prev) => prev + 1)
  }

  function handleDeleted(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id))
    setTotal((prev) => Math.max(0, prev - 1))
  }

  function handleTabChange(tab: FilterTab) {
    setActiveTab(tab)
    setPage(1)
  }

  function handlePageChange(newPage: number) {
    setPage(newPage)
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const filtered = files.filter(
    (f) =>
      matchesTab(f, activeTab) &&
      (!search || f.originalName.toLowerCase().includes(search.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Biblioteca de medios</h2>
          <p className="text-sm text-gray-500 mt-0.5">{total} archivo{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {error && <Alert variant="error" onDismiss={() => setError(null)}>{error}</Alert>}

      {/* Uploader */}
      <MediaUploader onUploaded={handleUploaded} />

      {/* Type filter tabs */}
      {(files.length > 0 || total > 0) && (
        <div className="flex gap-1 border-b border-gray-200">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={[
                'px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600',
                activeTab === tab.id
                  ? 'border-b-2 border-primary-600 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700',
              ].join(' ')}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      {(files.length > 0 || total > 0) && (
        <div className="relative max-w-xs">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Buscar archivos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 pl-9 pr-4 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600"
            aria-label="Buscar archivos"
          />
        </div>
      )}

      {/* Grid */}
      <div ref={gridRef}>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-video rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-300 mb-3" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <p className="text-sm text-gray-500">
              {search ? 'No se encontraron archivos con ese nombre.' : 'No hay archivos subidos aún.'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((file) => (
              <MediaCard key={file.id} file={file} onDeleted={handleDeleted} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Anterior
          </button>

          <span className="text-sm text-gray-500 min-w-[120px] text-center">
            Página <span className="font-semibold text-gray-900">{page}</span> de{' '}
            <span className="font-semibold text-gray-900">{totalPages}</span>
          </span>

          <button
            type="button"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          >
            Siguiente
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
