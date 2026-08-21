import { getActiveBanner } from '@/app/actions/banners'
import { getCategories } from '@/app/actions/categories'
import { CartProvider } from '@/components/cart-context'
import { JsonLd } from '@/components/json-ld'
import { SiteBanner } from '@/components/site-banner'
import { StoreRoutePrefetch } from '@/components/store-route-prefetch'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { FACEBOOK_URL, WHATSAPP_URL } from '@/lib/social-links'
import { Logo } from '@/components/logo'
import { Navbar } from '@/components/navbar'
import { storeGraphJsonLd } from '@/lib/seo'
import { SITE } from '@/lib/site'
import { catalogHref } from '@/lib/catalog-href'
import { mergeStoreCategories } from '@/lib/store-categories'
import { preconnect } from 'react-dom'

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  preconnect('https://res.cloudinary.com')

  const [categories, banner] = await Promise.all([getCategories(), getActiveBanner()])
  const storeCategories = mergeStoreCategories(categories)
  const prefetchHrefs = [
    '/products',
    '/checkout',
    ...storeCategories.slice(0, 6).map((category) => catalogHref({ category: category.slug })),
  ]

  return (
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
            {SITE.footerAbout}
          </p>
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
            Site web cree par{' '}
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
  )
}
