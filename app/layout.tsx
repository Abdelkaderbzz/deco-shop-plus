import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import { ToastProvider } from '@/components/toast-provider'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--font-serif',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')
const siteTitle = 'Water of Cold Parfume | Beaute feminine'
const siteDescription =
  'Water of Cold Parfume — boutique feminine en Tunisie. Parfums, maquillage, sacs et soins selectionnes avec amour pour sublimer votre elegance.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  keywords: [
    'beaute',
    'parfum',
    'maquillage',
    'sacs',
    'soins',
    'Tunisie',
    'Water of Cold Parfume',
    'femme',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_TN',
    url: siteUrl,
    siteName: 'Water of Cold Parfume',
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#fef8f6',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`bg-background ${cormorant.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        <ToastProvider>{children}</ToastProvider>
        {process.env.VERCEL === '1' && <Analytics />}
      </body>
    </html>
  )
}
