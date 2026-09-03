import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cairo, Montserrat } from 'next/font/google'
import { StorefrontScale } from '@/components/storefront-scale'
import { MetaPixel } from '@/components/meta-pixel'
import { ThemeScript } from '@/components/theme-script'
import { ToastProvider } from '@/components/toast-provider'
import { DEFAULT_LOCALE, LOCALE_META } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/dictionary'
import { getLocale } from '@/lib/i18n/get-locale'
import { SITE, SITE_KEYWORDS } from '@/lib/site'
import { getSiteUrl } from '@/lib/site-url'
import { headers } from 'next/headers'
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
})

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-cairo',
  display: 'swap',
  preload: true,
  adjustFontFallback: true,
})

const siteUrl = getSiteUrl()

export async function generateMetadata(): Promise<Metadata> {
  const isStorefront = (await headers()).get('x-storefront') !== '0'
  const locale = isStorefront ? await getLocale() : 'fr'
  const dict = getDictionary(locale)
  const meta = LOCALE_META[locale]
  const siteTitle = dict.home.title(SITE.name, dict.site.neighborhood, dict.site.city)

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteTitle,
      template: `%s | ${SITE.name}`,
    },
    description: dict.site.description,
    keywords: [SITE.name, ...dict.site.keywords, ...SITE_KEYWORDS],
    applicationName: SITE.name,
    authors: [{ name: SITE.name, url: siteUrl }],
    creator: SITE.name,
    publisher: SITE.name,
    category: 'shopping',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    verification: process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : undefined,
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
      locale: meta.ogLocale,
      alternateLocale: locale === 'ar' ? ['fr_TN'] : ['ar_TN'],
      url: siteUrl,
      siteName: SITE.name,
      title: siteTitle,
      description: dict.site.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: siteTitle,
      description: dict.site.description,
    },
    other: {
      'geo.region': 'TN-23',
      'geo.placename': `${dict.site.neighborhood}, ${dict.site.city}`,
    },
  }
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const isStorefront = (await headers()).get('x-storefront') !== '0'
  const locale = isStorefront ? await getLocale() : 'fr'
  const meta = LOCALE_META[locale] ?? LOCALE_META[DEFAULT_LOCALE]
  const fontClass = locale === 'ar' ? cairo.className : montserrat.className

  return (
    <html
      lang={meta.htmlLang}
      dir={meta.dir}
      className={`storefront bg-background ${montserrat.variable} ${cairo.variable}`}
      suppressHydrationWarning
    >
      <body className={`${fontClass} font-sans antialiased`} suppressHydrationWarning>
        <ThemeScript />
        <MetaPixel />
        <StorefrontScale />
        <ToastProvider>{children}</ToastProvider>
        {process.env.VERCEL === '1' && <Analytics />}
      </body>
    </html>
  )
}
