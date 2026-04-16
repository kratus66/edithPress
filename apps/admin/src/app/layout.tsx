import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | EdithPress Admin',
    default: 'EdithPress Admin',
  },
  description: 'Panel de administración de EdithPress — SaaS CMS Platform',
  robots: {
    index: false, // El admin nunca debe indexarse en buscadores
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
      <body className="bg-bg-secondary font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
