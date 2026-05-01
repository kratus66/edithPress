'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Badge, Card, Alert } from '@edithpress/ui'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog'
import { api, getApiErrorMessage } from '@/lib/api-client'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Template {
  id: string
  name: string
  description?: string | null
  thumbnailUrl?: string | null
  category: string
  isPremium: boolean
  tags: string[]
}

interface Page {
  id: string
  isHomepage: boolean
}

interface CreatedSite {
  id: string
  pages?: Page[]
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'Todos',      label: 'Todos' },
  { value: 'ecommerce',  label: 'E-commerce' },
  { value: 'portfolio',  label: 'Portfolio' },
  { value: 'restaurant', label: 'Restaurante' },
  { value: 'services',   label: 'Servicios' },
  { value: 'nonprofit',  label: 'ONG' },
]

// ── Template Card ──────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onUse,
}: {
  template: Template
  onUse: () => void
}) {
  return (
    <Card className="overflow-hidden flex flex-col group">
      {/* Thumbnail */}
      <div className="relative h-40 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center overflow-hidden">
        {template.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={template.thumbnailUrl}
            alt={`Preview de ${template.name}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl" aria-hidden="true">🌐</span>
        )}
        <div className="absolute top-2 right-2">
          {template.isPremium ? (
            <Badge variant="warning">PREMIUM</Badge>
          ) : (
            <Badge variant="success">GRATIS</Badge>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{template.name}</p>
          {template.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{template.description}</p>
          )}
        </div>
        {template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <Button
          size="sm"
          variant={template.isPremium ? 'outline' : 'primary'}
          onClick={onUse}
          className="w-full"
          aria-label={`Usar template ${template.name}`}
        >
          {template.isPremium ? 'Desbloquear template' : 'Usar este template'}
        </Button>
      </div>
    </Card>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TemplatesPage() {
  const router = useRouter()

  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState('Todos')

  // Confirmation dialog
  const [confirmTemplate, setConfirmTemplate] = useState<Template | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    api
      .get<{ data: Template[] }>('/templates')
      .then(({ data }) => setTemplates(data.data))
      .catch((err) => setError(getApiErrorMessage(err, 'No se pudieron cargar los templates.')))
      .finally(() => setIsLoading(false))
  }, [])

  function handleUse(template: Template) {
    if (template.isPremium) {
      router.push('/billing/upgrade')
      return
    }
    setCreateError(null)
    setConfirmTemplate(template)
  }

  async function handleConfirmCreate() {
    if (!confirmTemplate) return
    setIsCreating(true)
    setCreateError(null)
    try {
      const { data } = await api.post<{ data: CreatedSite }>('/sites', {
        name: confirmTemplate.name,
        templateId: confirmTemplate.id,
      })
      const site = data.data
      const pages = site.pages ?? []
      const homepage = pages.find((p) => p.isHomepage) ?? pages[0]
      if (homepage) {
        router.push(`/builder/${site.id}/${homepage.id}`)
      } else {
        router.push(`/sites/${site.id}`)
      }
    } catch (err) {
      setCreateError(getApiErrorMessage(err, 'No se pudo crear el sitio con este template.'))
      setIsCreating(false)
    }
  }

  const filtered =
    category === 'Todos' ? templates : templates.filter((t) => t.category === category)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Templates</h1>
        <p className="text-sm text-gray-500 mt-1">
          Empieza con un diseño profesional y personalízalo a tu gusto.
        </p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Category filters */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => setCategory(cat.value)}
            aria-pressed={category === cat.value}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${
              category === cat.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-sm text-gray-500">No hay templates en esta categoría todavía.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tpl) => (
            <TemplateCard key={tpl.id} template={tpl} onUse={() => handleUse(tpl)} />
          ))}
        </div>
      )}

      {/* Confirmation dialog */}
      <Dialog
        open={confirmTemplate !== null}
        onOpenChange={(open) => {
          if (!open && !isCreating) {
            setConfirmTemplate(null)
            setCreateError(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear sitio con este template</DialogTitle>
            <DialogDescription>
              Se creará un nuevo sitio usando el template{' '}
              <span className="font-medium text-gray-900">{confirmTemplate?.name}</span>.
              Podrás personalizarlo completamente desde el editor.
            </DialogDescription>
          </DialogHeader>

          {createError && (
            <Alert variant="error" className="mt-3">
              {createError}
            </Alert>
          )}

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmTemplate(null)
                setCreateError(null)
              }}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirmCreate} loading={isCreating} disabled={isCreating}>
              Crear sitio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
