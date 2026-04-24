import Image from 'next/image'

export interface ProductGridBlockProps {
  title: string
  subtitle: string
  columns: 2 | 3 | 4
  products: Array<{
    image: string
    imageAlt: string
    category: string
    name: string
    description: string
    price: string
    artisan: string
    ctaText: string
    ctaUrl: string
  }>
  backgroundColor: string
  textColor: string
  accentColor: string
  showCategory: boolean
  showArtisan: boolean
  cardStyle: 'shadow' | 'border' | 'minimal'
}

const colClasses: Record<number, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4',
}

const cardStyleClasses: Record<string, string> = {
  shadow: 'shadow-md hover:shadow-lg',
  border: 'border border-gray-200 hover:border-gray-300',
  minimal: '',
}

export function ProductGridBlock({
  title,
  subtitle,
  columns,
  products,
  backgroundColor,
  textColor,
  accentColor,
  showCategory,
  showArtisan,
  cardStyle,
}: ProductGridBlockProps) {
  if (!products?.length) return null

  const gridClass = colClasses[columns] ?? colClasses[3]
  const cardClass = cardStyleClasses[cardStyle] ?? ''

  return (
    <section style={{ backgroundColor, padding: '48px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {title && (
          <h2 style={{
            color: textColor,
            fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: subtitle ? 8 : 40,
          }}>
            {title}
          </h2>
        )}
        {subtitle && (
          <p style={{
            color: textColor,
            opacity: 0.7,
            textAlign: 'center',
            fontSize: '1.05rem',
            marginBottom: 40,
          }}>
            {subtitle}
          </p>
        )}

        <div className={`grid ${gridClass} gap-6`}>
          {products.map((product, i) => (
            <div
              key={i}
              className={`rounded-xl overflow-hidden bg-white flex flex-col transition-all ${cardClass}`}
            >
              {/* Imagen */}
              <div className="relative w-full bg-gray-100" style={{ aspectRatio: '4/3' }}>
                <Image
                  src={product.image}
                  alt={product.imageAlt || product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
                {showCategory && product.category && (
                  <span
                    className="absolute bottom-2 left-2 text-white text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wide"
                    style={{ background: accentColor }}
                  >
                    {product.category}
                  </span>
                )}
              </div>

              {/* Contenido */}
              <div className="p-4 flex flex-col flex-1">
                <h3 style={{ color: textColor }} className="font-semibold text-base leading-snug mb-1">
                  {product.name}
                </h3>
                {product.description && (
                  <p style={{ color: textColor }} className="text-sm opacity-65 mb-2 flex-1 leading-relaxed line-clamp-2">
                    {product.description}
                  </p>
                )}
                {showArtisan && product.artisan && (
                  <p style={{ color: textColor }} className="text-xs italic opacity-55 mb-3">
                    Por {product.artisan}
                  </p>
                )}
                <div className="flex items-center justify-between mt-auto pt-3">
                  <span style={{ color: accentColor }} className="font-bold text-lg">
                    {product.price}
                  </span>
                  <a
                    href={product.ctaUrl}
                    className="text-white text-sm font-semibold px-3 py-2 rounded-md no-underline whitespace-nowrap"
                    style={{ background: accentColor }}
                  >
                    {product.ctaText}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
