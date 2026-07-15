import { getFeaturedProducts } from '@/app/actions/products'
import { ProductCard } from '@/components/product-card'
import { InstagramCarousel } from '@/components/instagram-embed'
import { TestimonialsSection } from '@/components/testimonials-section'
import Link from 'next/link'

export const revalidate = 60

const INSTAGRAM_REELS: string[] = []

export default async function HomePage() {
  const featured = await getFeaturedProducts()

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-4 text-center bg-background">
        <div className="relative z-10 flex flex-col items-center gap-6">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/524882961_17994883307831957_4888978496307767385_n-TtsjvPe8IlxmIpNnpU0tEgXgfwr2N4.jpg"
            alt="Jannah Parfume"
            className="h-28 w-28 rounded-full object-cover ring-2 ring-primary/30 shadow-lg"
          />
          <div>
            <p className="text-[11px] font-light tracking-[0.4em] text-primary">BOUTIQUE DE PARFUMS</p>
            <h1 className="mt-3 font-serif text-5xl font-light tracking-widest text-foreground md:text-7xl">
              JANNAH<br />PARFUME
            </h1>
            <p className="mt-4 text-sm font-light tracking-widest text-muted-foreground">TUNISIE</p>
          </div>
          <p className="max-w-md text-base font-light leading-relaxed text-muted-foreground">
            Une selection soignee de parfums de qualite pour hommes et femmes.
          </p>
          <Link
            href="/products"
            className="mt-4 border border-primary px-10 py-3 text-xs font-light tracking-[0.3em] text-primary transition-all hover:bg-primary hover:text-primary-foreground"
          >
            DECOUVRIR
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="h-8 w-px bg-gradient-to-b from-primary to-transparent" />
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="mb-12 text-center">
            <p className="text-[10px] font-light tracking-[0.4em] text-primary">SELECTION</p>
            <h2 className="mt-2 font-serif text-3xl font-light tracking-widest text-foreground">COUP DE COEUR</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/products"
              className="border border-border px-10 py-3 text-xs font-light tracking-[0.3em] text-muted-foreground transition-all hover:border-primary hover:text-primary"
            >
              VOIR TOUT
            </Link>
          </div>
        </section>
      )}

      <TestimonialsSection />

      {/* Instagram */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <p className="text-[10px] font-light tracking-[0.4em] text-primary">INSTAGRAM</p>
            <h2 className="mt-2 font-serif text-3xl font-light tracking-widest text-foreground">
              NOTRE CONTENU
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm font-light text-muted-foreground">
              Decouvrez nos dernieres videos et coulisses sur Instagram.
            </p>
          </div>

          <InstagramCarousel reels={INSTAGRAM_REELS} />

          <div className="mt-10 text-center">
            <a
              href="https://www.instagram.com/jannahparfume/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 border border-primary px-8 py-3 text-xs font-light tracking-[0.3em] text-primary transition-all hover:bg-primary hover:text-primary-foreground"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              SUIVRE @jannahparfume
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
