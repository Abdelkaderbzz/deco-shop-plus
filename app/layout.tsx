import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import { ThemeScript } from '@/components/theme-script'
import { ToastProvider } from '@/components/toast-provider'
import { SITE_LANG, SITE_OG_LOCALE } from '@/lib/locale'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '600'],
  variable: '--font-serif',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')
const siteTitle = 'Water of Gold | Parfumerie a Sousse'
const siteDescription =
  'Water of Gold est une boutique de parfums a Sousse, Tunisie. Fragrances inspirees des plus grandes marques internationales et parfums de choix, de longue tenue, pour femmes et hommes.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  keywords: [
    'parfum',
    'parfumerie',
    'Sousse',
    'Tunisie',
    'Water of Gold',
    'parfum femme',
    'parfum homme',
    'fragrance',
  ],
  alternates: {
    canonical: '/',
    languages: {
      'fr-TN': '/',
      fr: '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: SITE_OG_LOCALE,
    url: siteUrl,
    siteName: 'Water of Gold',
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
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6efdc' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0b0b' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang={SITE_LANG} className={`bg-background ${cormorant.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeScript />
        <ToastProvider>{children}</ToastProvider>
        {process.env.VERCEL === '1' && <Analytics />}
      </body>
    </html>
  )
}
