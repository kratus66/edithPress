import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['100', '300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    template: '%s | EdithPress Builder',
    default: 'EdithPress Builder',
  },
  description: 'Editor visual de páginas de EdithPress — SaaS CMS Platform',
  robots: {
    index: false,
    follow: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="bg-white antialiased" style={{ fontFamily: 'var(--font-inter, ui-sans-serif, system-ui, sans-serif)' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
