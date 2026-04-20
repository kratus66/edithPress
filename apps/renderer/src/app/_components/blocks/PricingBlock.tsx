/**
 * PricingBlock — Renderer (read-only)
 *
 * Props idénticas al builder (apps/builder/src/blocks/PricingBlock.tsx).
 * El builder es la fuente de verdad del schema.
 */
import Link from 'next/link'

export interface PricingPlan {
  name: string
  price: string
  description?: string
  /**
   * Lista de características separadas por '\n'.
   * El renderer las divide y renderiza como lista con ✓.
   */
  features: string
  ctaText: string
  ctaUrl: string
  /** 'true' | 'false' — viene como string del JSON de Puck */
  isHighlighted: 'true' | 'false'
}

export interface PricingBlockProps {
  title?: string
  plans: PricingPlan[]
}

// ── Componente de plan individual ──────────────────────────────────────────────

function PricingCard({ plan }: { plan: PricingPlan }) {
  const highlighted = plan.isHighlighted === 'true'
  const featureList = plan.features
    ? plan.features.split('\n').filter((f) => f.trim().length > 0)
    : []

  return (
    <div
      className={`relative flex flex-col rounded-2xl border bg-white p-8 shadow-sm transition-shadow hover:shadow-md ${
        highlighted
          ? 'border-indigo-600 ring-2 ring-indigo-600'
          : 'border-gray-200'
      }`}
    >
      {/* Badge "Más popular" */}
      {highlighted && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-xs font-semibold text-white">
          Más popular
        </span>
      )}

      {/* Cabecera */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
        {plan.description && (
          <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
        )}
        <p className="mt-4 text-4xl font-extrabold text-gray-900">
          {plan.price}
        </p>
      </div>

      {/* Lista de características */}
      {featureList.length > 0 && (
        <ul className="mb-8 flex flex-col gap-3 flex-1" role="list">
          {featureList.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span
                className="mt-0.5 flex-shrink-0 text-indigo-600 font-bold"
                aria-hidden="true"
              >
                ✓
              </span>
              <span>{feature.trim()}</span>
            </li>
          ))}
        </ul>
      )}

      {/* CTA */}
      {plan.ctaText && plan.ctaUrl && (
        <Link
          href={plan.ctaUrl}
          className={`mt-auto block w-full rounded-lg px-6 py-3 text-center text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            highlighted
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-400'
          }`}
        >
          {plan.ctaText}
        </Link>
      )}
    </div>
  )
}

// ── Componente principal ───────────────────────────────────────────────────────

export function PricingBlock({ title, plans }: PricingBlockProps) {
  if (!plans?.length) return null

  // Grid responsivo: 1 col en móvil, hasta 3 en desktop
  const gridCols =
    plans.length === 1
      ? 'grid-cols-1 max-w-sm'
      : plans.length === 2
        ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

  return (
    <section className="px-6 py-12 max-w-6xl mx-auto">
      {title && (
        <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">
          {title}
        </h2>
      )}
      <div className={`mx-auto grid ${gridCols} gap-8 items-stretch`}>
        {plans.map((plan, i) => (
          <PricingCard key={i} plan={plan} />
        ))}
      </div>
    </section>
  )
}
