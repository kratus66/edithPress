'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Badge, Card, Alert } from '@edithpress/ui'
import { api, getApiErrorMessage } from '@/lib/api-client'

interface Template {
  id: string; name: string; description?: string; thumbnailUrl?: string
  category: string; isPremium: boolean; tags: string[]
}

const CATEGORIES = ['Todos', 'portfolio', 'restaurant', 'services', 'store', 'blog', 'other']

function TemplateCard({ template, onUse }: { template: Template; onUse: () => void }) {
  return (
    <Card className="overflow-hidden flex flex-col group">
      {/* Thumbnail */}
      <div className="relative h-40 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        {template.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={template.thumbnailUrl} alt={`Preview de ${template.name}`} className="w-full h-full object-cover" />
        ) : (
          <span className="text-4xl" aria-hidden="true">🌐</span>
        )}
        {template.isPremium && (
          <div className="absolute top-2 right-2">
            <Badge variant="warning">Premium</Badge>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div>
          <p className="font-semibold text-gray-900">{template.name}</p>
          {template.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{template.description}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-1 flex-1">
          {template.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
        <Button
          size="sm"
          variant={template.isPremium ? 'outline' : 'primary'}
          onClick={onUse}
          className="w-full"
        >
          {template.isPremium ? '🔒 Usar template' : 'Usar template'}
        </Button>
      </div>
    </Card>
  )
}

export default function TemplatesPage() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState('Todos')
  const [creating, setCreating] = useState<string | null>(null)

  useEffect(() => {
    api.get<{ data: Template[] }>('/templates')
      .then(({ data }) => setTemplates(data.data))
      .catch((err) => setError(getApiErrorMessage(err, 'No se pudieron cargar los templates.')))
      .finally(() => setIsLoading(false))
  }, [])

  async function handleUse(templateId: string, isPremium: boolean) {
    if (isPremium) {
      router.push('/billing/upgrade')
      return
    }
    setCreating(templateId)
    try {
      const { data } = await api.post<{ data: { id: string } }>('/sites', {
        name: 'Mi nuevo sitio',
        templateId,
      })
      router.push(`/sites/${data.data.id}`)
    } catch (err) {
      setError(getApiErrorMessage(err, 'No se pudo crear el sitio con este template.'))
    } finally {
      setCreating(null)
    }
  }

  const filtered = category === 'Todos'
    ? templates
    : templates.filter((t) => t.category === category)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Templates</h2>
        <p className="text-sm text-gray-500 mt-1">Empieza con un diseño profesional y personalízalo a tu gusto.</p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Filtros */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 ${
              category === cat
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            aria-pressed={category === cat}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-sm text-gray-500">No hay templates en esta categoría.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((tpl) => (
            <TemplateCard
              key={tpl.id}
              template={tpl}
              onUse={() => handleUse(tpl.id, tpl.isPremium)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
