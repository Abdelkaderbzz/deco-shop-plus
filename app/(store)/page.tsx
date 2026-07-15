import { getFeaturedProducts } from '@/app/actions/products'
import { getCategories } from '@/app/actions/categories'
import { CategoriesSection } from '@/components/categories-section'
import { Logo } from '@/components/logo'
import { ProductCard } from '@/components/product-card'
import { InstagramCarousel, InstagramFollowButton, InstagramSectionHeader } from '@/components/instagram-embed'
import { TestimonialsSection } from '@/components/testimonials-section'
import { HERO_IMAGES } from '@/lib/store-categories'
import Link from 'next/link'

export const revalidate = 60

const INSTAGRAM_REELS: string[] = [
  'https://www.instagram.com/reel/DZ3XNGpsShF/',
  'https://www.instagram.com/reel/DYdIM1eMPri/',
  'https://www.instagram.com/reel/DaTQO_4RzjP/',
  'https://www.instagram.com/reel/DZvMI4OsOJd/',
]

export default async function HomePage() {
  const [featured, categories] = await Promise.all([getFeaturedProducts(), getCategories()])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 bg-background">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-secondary blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:gap-12 md:py-24">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <Logo size="lg" className="md:h-36 md:w-36" />
            <div className="mt-6">
              <h1 className="font-serif text-4xl font-light tracking-wide text-foreground md:text-5xl">
                Beaute feminine
              </h1>
              <p className="mt-3 text-[11px] font-light tracking-[0.4em] text-primary">
                PARFUMS &middot; MAQUILLAGE &middot; SACS &middot; SOINS
              </p>
              <p className="mt-4 text-sm font-light tracking-widest text-muted-foreground">TUNISIE</p>
            </div>
            <p className="mt-6 max-w-md text-base font-light leading-relaxed text-muted-foreground">
              Votre boutique en ligne pour parfums, maquillage, sacs et soins des produits choisis avec amour pour
              reveler votre elegance.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <Link
                href="/products"
                className="rounded-full border border-primary bg-primary px-8 py-3 text-xs font-light tracking-[0.3em] text-primary-foreground transition-all hover:bg-primary/90"
              >
                VOIR LA BOUTIQUE
              </Link>
              <Link
                href="/products?category=parfums"
                className="rounded-full border border-border px-8 py-3 text-xs font-light tracking-[0.3em] text-muted-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
              >
                PARFUMS
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="space-y-3 md:space-y-4">
              <div className="overflow-hidden rounded-3xl border border-border/60 shadow-sm shadow-primary/10">
                <img src={HERO_IMAGES[0].src} alt={HERO_IMAGES[0].alt} className="aspect-[3/4] w-full object-cover" />
              </div>
              <div className="overflow-hidden rounded-3xl border border-border/60 shadow-sm shadow-primary/10">
                <img src={HERO_IMAGES[3].src} alt={HERO_IMAGES[3].alt} className="aspect-square w-full object-cover" />
              </div>
            </div>
            <div className="space-y-3 pt-8 md:space-y-4 md:pt-12">
              <div className="overflow-hidden rounded-3xl border border-border/60 shadow-sm shadow-primary/10">
                <img src={HERO_IMAGES[1].src} alt={HERO_IMAGES[1].alt} className="aspect-square w-full object-cover" />
              </div>
              <div className="overflow-hidden rounded-3xl border border-border/60 shadow-sm shadow-primary/10">
                <img src={HERO_IMAGES[4].src} alt={HERO_IMAGES[4].alt} className="aspect-[3/4] w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <CategoriesSection />

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="mb-12 text-center">
            <p className="text-[10px] font-light tracking-[0.4em] text-primary">SELECTION</p>
            <h2 className="mt-2 font-serif text-3xl font-light tracking-widest text-foreground">COUPS DE COEUR</h2>
            <p className="mx-auto mt-3 max-w-md text-sm font-light text-muted-foreground">
              Nos produits preferes du moment, parfums, maquillage et accessoires.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} categories={categories} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/products"
              className="rounded-full border border-border px-10 py-3 text-xs font-light tracking-[0.3em] text-muted-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
            >
              TOUTE LA BOUTIQUE
            </Link>
          </div>
        </section>
      )}

      <TestimonialsSection />

      {/* Instagram */}
      <section className="border-t border-border bg-secondary/30 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <InstagramSectionHeader />
          <InstagramCarousel reels={INSTAGRAM_REELS} />
          <InstagramFollowButton />
        </div>
      </section>
    </div>
  )
}
