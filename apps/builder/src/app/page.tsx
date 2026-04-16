export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">EdithPress Builder</h1>
        <p className="mt-4 text-lg text-gray-500">
          Editor visual — próximamente disponible
        </p>
        <p className="mt-2 text-sm text-gray-400">
          Ve a{' '}
          <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs">
            /builder/[siteId]/[pageId]
          </code>{' '}
          para editar una página
        </p>
      </div>
    </main>
  )
}
