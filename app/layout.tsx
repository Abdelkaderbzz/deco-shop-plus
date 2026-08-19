import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Montserrat } from 'next/font/google'
import { StorefrontScale } from '@/components/storefront-scale'
import { ThemeScript } from '@/components/theme-script'
import { ToastProvider } from '@/components/toast-provider'
import { SITE_LANG, SITE_OG_LOCALE } from '@/lib/locale'
import { SITE, SITE_KEYWORDS } from '@/lib/site'
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')
const siteTitle = `${SITE.name} | ${SITE.tagline} a ${SITE.city}`
const siteDescription = SITE.description

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  keywords: [...SITE_KEYWORDS],
  icons: {
    icon: '/assets/deco-shop-logo.webp',
    apple: '/apple-icon.png',
  },
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
    siteName: SITE.name,
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
    { media: '(prefers-color-scheme: light)', color: '#F1F4F2' },
    { media: '(prefers-color-scheme: dark)', color: '#0D1514' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang={SITE_LANG} className={`bg-background ${montserrat.variable}`} suppressHydrationWarning>
      <body className={`${montserrat.className} font-sans antialiased`} suppressHydrationWarning>
        <ThemeScript />
        <StorefrontScale />
        <ToastProvider>{children}</ToastProvider>
        {process.env.VERCEL === '1' && <Analytics />}
      </body>
    </html>
  )
}
