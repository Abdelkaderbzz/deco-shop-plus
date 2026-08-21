import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Montserrat } from 'next/font/google'
import { StorefrontScale } from '@/components/storefront-scale'
import { ThemeScript } from '@/components/theme-script'
import { ToastProvider } from '@/components/toast-provider'
import { SITE_LOCALE, SITE_OG_LOCALE } from '@/lib/locale'
import { SITE, SITE_KEYWORDS } from '@/lib/site'
import { getSiteUrl } from '@/lib/site-url'
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
})

const siteUrl = getSiteUrl()
const siteTitle = `${SITE.name} | Décoration à ${SITE.neighborhood}, ${SITE.city}`
const siteDescription = SITE.description

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s | ${SITE.name}`,
  },
  description: siteDescription,
  keywords: [...SITE_KEYWORDS],
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: siteUrl }],
  creator: SITE.name,
  publisher: SITE.name,
  category: 'shopping',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
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
  other: {
    'geo.region': 'TN-23',
    'geo.placename': `${SITE.neighborhood}, ${SITE.city}`,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
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
    <html lang={SITE_LOCALE} className={`storefront bg-background ${montserrat.variable}`} suppressHydrationWarning>
      <body className={`${montserrat.className} font-sans antialiased`} suppressHydrationWarning>
        <ThemeScript />
        <StorefrontScale />
        <ToastProvider>{children}</ToastProvider>
        {process.env.VERCEL === '1' && <Analytics />}
      </body>
    </html>
  )
}
