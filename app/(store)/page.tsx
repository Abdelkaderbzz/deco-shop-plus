import { getBoutiques } from '@/app/actions/boutiques'
import { getCategories } from '@/app/actions/categories'
import { getHeroImages } from '@/app/actions/hero'
import { getFeaturedProducts } from '@/app/actions/products'
import { BoutiquesSection } from '@/components/boutiques-section'
import { CategoriesSection } from '@/components/categories-section'
import { Logo } from '@/components/logo'
import { ProductCard } from '@/components/product-card'
import {
  InstagramFollowButton,
  InstagramSectionHeader,
} from '@/components/instagram-section-static'
import { TestimonialsSection } from '@/components/testimonials-section'
import { mergeStoreCategories } from '@/lib/store-categories'
import Image from 'next/image'
import Link from 'next/link'

export const revalidate = 120

export default async function HomePage() {
  const [featured, categories, heroImages, boutiques] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getHeroImages(),
    getBoutiques(),
  ])
  const storeCategories = mergeStoreCategories(categories)
  const [heroTopLeft, heroTopRight, heroBottomLeft, heroBottomRight] = heroImages

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 bg-background">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-secondary blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-2 md:gap-10 md:py-16">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <Logo size="lg" className="md:h-28 md:w-28" priority />
            <div className="mt-4">
              <h1 className="font-serif text-3xl font-light tracking-wide text-foreground md:text-4xl">
                Water of Gold
              </h1>
              <p className="mt-2 text-[10px] font-light tracking-[0.4em] text-primary">
                PARFUMS FEMME &amp; HOMME
              </p>
              <p className="mt-3 text-sm font-light tracking-widest text-muted-foreground">SOUSSE, TUNISIE</p>
            </div>
            <p className="mt-4 max-w-md text-sm font-light leading-relaxed text-muted-foreground">
              Boutique de parfums a Sousse. Fragrances inspirees des plus grandes marques internationales et parfums de
              choix, de longue tenue, pour femmes et hommes.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 md:justify-start">
              <Link
                href="/products"
                className="rounded-full border border-primary bg-primary px-6 py-2.5 text-[11px] font-light tracking-[0.3em] text-primary-foreground transition-all hover:bg-primary/90"
              >
                VOIR LA BOUTIQUE
              </Link>
              <Link
                href="/products?category=femme"
                className="rounded-full border border-border px-6 py-2.5 text-[11px] font-light tracking-[0.3em] text-muted-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
              >
                FEMME
              </Link>
              <Link
                href="/products?category=homme"
                className="rounded-full border border-border px-6 py-2.5 text-[11px] font-light tracking-[0.3em] text-muted-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
              >
                HOMME
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="space-y-3 md:space-y-4">
              <div className="relative aspect-3/4 overflow-hidden rounded-3xl border border-border/60 shadow-sm shadow-primary/10">
                <Image
                  src={heroTopLeft.imageUrl}
                  alt={heroTopLeft.alt}
                  fill
                  priority
                  sizes="(max-width: 768px) 45vw, 280px"
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-square overflow-hidden rounded-3xl border border-border/60 shadow-sm shadow-primary/10">
                <Image
                  src={heroBottomLeft.imageUrl}
                  alt={heroBottomLeft.alt}
                  fill
                  sizes="(max-width: 768px) 45vw, 280px"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="space-y-3 pt-6 md:space-y-4 md:pt-8">
              <div className="relative aspect-square overflow-hidden rounded-3xl border border-border/60 shadow-sm shadow-primary/10">
                <Image
                  src={heroTopRight.imageUrl}
                  alt={heroTopRight.alt}
                  fill
                  priority
                  sizes="(max-width: 768px) 45vw, 280px"
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-3/4 overflow-hidden rounded-3xl border border-border/60 shadow-sm shadow-primary/10">
                <Image
                  src={heroBottomRight.imageUrl}
                  alt={heroBottomRight.alt}
                  fill
                  sizes="(max-width: 768px) 45vw, 280px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <CategoriesSection categories={storeCategories} />

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12 md:py-14">
          <div className="mb-8 text-center">
            <p className="text-[10px] font-light tracking-[0.4em] text-primary">SELECTION</p>
            <h2 className="mt-2 font-serif text-2xl font-light tracking-widest text-foreground">COUPS DE COEUR</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} categories={categories} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/products"
              className="rounded-full border border-border px-8 py-2.5 text-[11px] font-light tracking-[0.3em] text-muted-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
            >
              TOUTE LA BOUTIQUE
            </Link>
          </div>
        </section>
      )}

      <TestimonialsSection />

      <BoutiquesSection boutiques={boutiques} />

      {/* Instagram */}
      <section className="border-t border-border bg-secondary/30 py-12 md:py-14">
        <div className="mx-auto max-w-6xl px-4">
          <InstagramSectionHeader />
          <InstagramFollowButton />
        </div>
      </section>
    </div>
  )
}
