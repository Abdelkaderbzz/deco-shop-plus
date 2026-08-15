import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Bodoni_Moda, Josefin_Sans } from 'next/font/google'
import { StorefrontScale } from '@/components/storefront-scale'
import { ThemeScript } from '@/components/theme-script'
import { ToastProvider } from '@/components/toast-provider'
import { SITE_LANG, SITE_OG_LOCALE } from '@/lib/locale'
import './globals.css'

const bodoni = Bodoni_Moda({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

const josefin = Josefin_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700'],
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
    <html lang={SITE_LANG} className={`bg-background ${bodoni.variable} ${josefin.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeScript />
        <StorefrontScale />
        <ToastProvider>{children}</ToastProvider>
        {process.env.VERCEL === '1' && <Analytics />}
      </body>
    </html>
  )
}
