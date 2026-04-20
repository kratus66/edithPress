import Image from 'next/image'

export interface CardGridBlockProps {
  title?: string
  cards: Array<{
    title: string
    description?: string
    image?: string
    linkUrl?: string
  }>
  columns: 2 | 3 | 4
}

const COLUMN_CLASSES: Record<number, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
}

export function CardGridBlock({ title, cards, columns }: CardGridBlockProps) {
  if (!cards?.length) return null

  const gridClass = COLUMN_CLASSES[columns] ?? COLUMN_CLASSES[3]

  return (
    <section className="px-6 py-8 max-w-6xl mx-auto">
      {title && (
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      )}
      <div className={`grid ${gridClass} gap-6`}>
        {cards.map((card, i) => {
          const inner = (
            <div className="flex flex-col h-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
              {card.image && (
                <div className="relative aspect-[16/10] w-full bg-gray-100">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="flex flex-col flex-1 p-4">
                <h3 className="font-semibold text-gray-900 text-base mb-1">
                  {card.title}
                </h3>
                {card.description && (
                  <p className="text-sm text-gray-600 flex-1">{card.description}</p>
                )}
                {card.linkUrl && (
                  <span className="mt-3 text-sm font-medium text-blue-600">
                    Leer más →
                  </span>
                )}
              </div>
            </div>
          )

          return card.linkUrl ? (
            <a
              key={i}
              href={card.linkUrl}
              className="block no-underline"
              aria-label={card.title}
            >
              {inner}
            </a>
          ) : (
            <div key={i}>{inner}</div>
          )
        })}
      </div>
    </section>
  )
}
