import { getCategories } from '@/app/actions/categories'
import { CartProvider } from '@/components/cart-context'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { INSTAGRAM_URL, TIKTOK_URL } from '@/lib/social-links'
import { Logo } from '@/components/logo'
import { Navbar } from '@/components/navbar'
import { mergeStoreCategories } from '@/lib/store-categories'

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories()
  const storeCategories = mergeStoreCategories(categories)

  return (
    <CartProvider>
      <Navbar storeCategories={storeCategories} />
      <main className="min-h-screen pt-[73px]">{children}</main>
      <footer className="border-t border-border bg-foreground py-12">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <Logo size="md" className="mx-auto mb-4" />
          <p className="text-xs font-light tracking-widest text-secondary">
            BEAUTE FEMININE &middot; PARFUMS, MAQUILLAGE, SACS & SOINS
          </p>
          <p className="mt-1 text-[11px] font-light tracking-widest text-secondary/90">
            TUNISIE
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-light tracking-widest text-[#e8b4a8] hover:underline"
            >
              @parfumerie_jannah_
            </a>
            <a
              href={TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-light tracking-widest text-[#e8b4a8] hover:underline"
            >
              @parfumeriejanna3
            </a>
          </div>
          <p className="mt-4 text-[11px] text-secondary/80">
            &copy; {new Date().getFullYear()} Parfumerie Janna. Tous droits reserves.
          </p>
        </div>
      </footer>
      <WhatsAppButton />
    </CartProvider>
  )
}
