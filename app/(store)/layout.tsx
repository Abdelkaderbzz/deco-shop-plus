import { CartProvider } from '@/components/cart-context'
import { INSTAGRAM_URL } from '@/components/instagram-embed'
import { Logo } from '@/components/logo'
import { Navbar } from '@/components/navbar'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Navbar />
      <main className="min-h-screen pt-[73px]">{children}</main>
      <footer className="border-t border-border bg-foreground py-12">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <Logo size="md" className="mx-auto mb-4" />
          <p className="text-xs font-light tracking-widest text-secondary">
            BEAUTE FEMININE &mdash; PARFUMS, MAQUILLAGE, SACS & SOINS
          </p>
          <p className="mt-1 text-[11px] font-light tracking-widest text-muted-foreground/70">
            TUNISIE
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-xs font-light tracking-widest text-primary hover:underline"
          >
            @parfumerie_jannah_
          </a>
          <p className="mt-4 text-[11px] text-muted-foreground/60">
            &copy; {new Date().getFullYear()} Parfumerie Janna. Tous droits reserves.
          </p>
        </div>
      </footer>
    </CartProvider>
  )
}
