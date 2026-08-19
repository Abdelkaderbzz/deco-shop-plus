import { getActiveBanner } from '@/app/actions/banners'
import { getCategories } from '@/app/actions/categories'
import { CartProvider } from '@/components/cart-context'
import { SiteBanner } from '@/components/site-banner'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { FACEBOOK_URL, PHONE_HREF, WHATSAPP_URL } from '@/lib/social-links'
import { Logo } from '@/components/logo'
import { Navbar } from '@/components/navbar'
import { Reveal } from '@/components/reveal'
import { SITE } from '@/lib/site'
import { mergeStoreCategories } from '@/lib/store-categories'

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [categories, banner] = await Promise.all([getCategories(), getActiveBanner()])
  const storeCategories = mergeStoreCategories(categories)

  return (
    <CartProvider>
      {banner && <SiteBanner banner={banner} />}
      <Navbar storeCategories={storeCategories} />
      <main className="min-h-screen">{children}</main>
      <footer className="border-t border-border bg-card py-12">
        <Reveal className="mx-auto max-w-7xl px-2 text-center sm:px-3">
          <Logo size="lg" className="mx-auto mb-5 justify-center" />
          <p className="text-sm font-medium text-primary">{SITE.tagline}</p>
          <p className="mt-2 text-sm text-muted-foreground">{SITE.address}</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <a href={PHONE_HREF} className="text-sm font-medium text-foreground hover:text-primary">
              {SITE.phoneDisplay}
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline"
            >
              WhatsApp
            </a>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline"
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
        </Reveal>
      </footer>
      <WhatsAppButton />
    </CartProvider>
  )
}
