import { getActiveBanner } from '@/app/actions/banners'
import { getCategories } from '@/app/actions/categories'
import { CartProvider } from '@/components/cart-context'
import { JsonLd } from '@/components/json-ld'
import { SiteBanner } from '@/components/site-banner'
import { StoreRoutePrefetch } from '@/components/store-route-prefetch'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { FACEBOOK_URL, MAPS_URL, PHONE_HREF, WHATSAPP_URL } from '@/lib/social-links'
import { Logo } from '@/components/logo'
import { Navbar } from '@/components/navbar'
import { storeGraphJsonLd } from '@/lib/seo'
import { getStorefrontI18n } from '@/lib/i18n/get-locale'
import { I18nProvider } from '@/lib/i18n/provider'
import { localizeCategories } from '@/lib/i18n/categories'
import { catalogHref } from '@/lib/catalog-href'
import { mergeStoreCategories } from '@/lib/store-categories'
import { SITE } from '@/lib/site'
import { preconnect } from 'react-dom'

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  preconnect('https://res.cloudinary.com')

  const [{ locale, dict }, categories, banner] = await Promise.all([
    getStorefrontI18n(),
    getCategories(),
    getActiveBanner(),
  ])
  const storeCategories = localizeCategories(mergeStoreCategories(categories), dict)
  const prefetchHrefs = [
    '/products',
    '/checkout',
    ...storeCategories.slice(0, 6).map((category) => catalogHref({ category: category.slug })),
  ]

  return (
    <I18nProvider locale={locale}>
      <CartProvider>
        <StoreRoutePrefetch hrefs={prefetchHrefs} />
        <JsonLd data={storeGraphJsonLd()} />
        {banner && <SiteBanner banner={banner} />}
        <Navbar storeCategories={storeCategories} />
        <main className="min-h-screen">{children}</main>
        <footer className="border-t border-border bg-card py-12">
          <div className="mx-auto max-w-7xl px-2 text-center sm:px-3">
            <Logo size="lg" className="mx-auto mb-5 justify-center" />
            <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground">
              {dict.site.footerAbout}
            </p>
            <address className="mx-auto mt-5 max-w-lg not-italic text-sm leading-relaxed text-muted-foreground">
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary hover:underline"
              >
                {dict.site.address}
              </a>
              <span className="mx-2 text-border" aria-hidden>
                ·
              </span>
              <a href={PHONE_HREF} className="hover:text-primary hover:underline">
                {SITE.phoneDisplay}
              </a>
            </address>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline"
              >
                WhatsApp
              </a>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline"
              >
                Facebook
              </a>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              {dict.footer.madeBy}{' '}
              <a
                href="https://www.revixa.agency/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-primary hover:underline"
              >
                Revixa Agency
              </a>
            </p>
          </div>
        </footer>
        <WhatsAppButton />
      </CartProvider>
    </I18nProvider>
  )
}
