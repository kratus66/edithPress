import Link from 'next/link'
import { Button, Card, Badge } from '@edithpress/ui'

const PLANS = [
  {
    slug: 'starter', name: 'Starter', price: 0, priceLabel: 'Gratis',
    description: 'Para empezar a explorar',
    features: ['1 sitio', '5 páginas', '1 GB almacenamiento', 'Subdominio .edithpress.com', 'Soporte por email'],
    cta: 'Plan actual', disabled: true,
  },
  {
    slug: 'business', name: 'Business', price: 19, priceLabel: '$19/mes',
    description: 'Para negocios en crecimiento',
    features: ['3 sitios', 'Páginas ilimitadas', '10 GB almacenamiento', 'Dominio personalizado', 'Analítica básica', 'Soporte prioritario'],
    cta: 'Elegir Business', popular: true,
  },
  {
    slug: 'pro', name: 'Pro', price: 49, priceLabel: '$49/mes',
    description: 'Para equipos y agencias',
    features: ['Sitios ilimitados', 'Páginas ilimitadas', '50 GB almacenamiento', 'Múltiples dominios', 'Analítica avanzada', 'White-label', 'API pública'],
    cta: 'Elegir Pro',
  },
]

export default function UpgradePage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Elige tu plan</h2>
        <p className="mt-2 text-sm text-gray-500">Cancela cuando quieras. Sin permanencia.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <Card
            key={plan.slug}
            className={`p-6 flex flex-col relative ${plan.popular ? 'border-2 border-primary-600 shadow-md' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="primary" className="px-3 py-1">Más popular</Badge>
              </div>
            )}

            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{plan.name}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{plan.priceLabel}</p>
              <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
            </div>

            <ul className="flex-1 space-y-2 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600 shrink-0" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            {plan.disabled ? (
              <Button variant="outline" disabled className="w-full">{plan.cta}</Button>
            ) : (
              <form action="/api/billing/checkout" method="POST">
                <input type="hidden" name="planSlug" value={plan.slug} />
                <Button type="submit" variant={plan.popular ? 'primary' : 'outline'} className="w-full">
                  {plan.cta}
                </Button>
              </form>
            )}
          </Card>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400">
        Precios en USD. IVA puede aplicar según tu país.{' '}
        <Link href="/billing" className="text-primary-600 hover:underline">Volver a facturación</Link>
      </p>
    </div>
  )
}
