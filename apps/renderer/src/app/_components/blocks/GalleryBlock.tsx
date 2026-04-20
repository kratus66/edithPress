import Image from 'next/image'

export interface GalleryBlockProps {
  images: Array<{
    src: string
    alt: string
    caption?: string
  }>
  columns: 2 | 3 | 4
}

const COLUMN_CLASSES: Record<number, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
}

export function GalleryBlock({ images, columns }: GalleryBlockProps) {
  if (!images?.length) return null

  const gridClass = COLUMN_CLASSES[columns] ?? COLUMN_CLASSES[3]

  return (
    <section className={`grid ${gridClass} gap-4 px-6 py-8 max-w-6xl mx-auto`}>
      {images.map((img, i) => (
        <figure key={i} className="m-0 overflow-hidden rounded-lg bg-gray-100">
          <div className="relative aspect-[4/3] w-full">
            <Image
              src={img.src}
              alt={img.alt || ''}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
          {img.caption && (
            <figcaption className="px-3 py-2 text-sm text-gray-500 text-center">
              {img.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </section>
  )
}
