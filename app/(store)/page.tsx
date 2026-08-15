import { getCarouselVideoUrls } from '@/app/actions/carousel'
import { getCategories } from '@/app/actions/categories'
import { getHeroImages } from '@/app/actions/hero'
import { getFeaturedProducts } from '@/app/actions/products'
import { CategoriesSection } from '@/components/categories-section'
import { Logo } from '@/components/logo'
import { ProductCard } from '@/components/product-card'
import {
  InstagramFollowButton,
  InstagramSectionHeader,
} from '@/components/instagram-section-static'
import { mergeStoreCategories } from '@/lib/store-categories'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'

const TestimonialsSection = dynamic(
  () => import('@/components/testimonials-section').then((m) => m.TestimonialsSection),
  {
    loading: () => <div className="border-t border-border bg-secondary/50 py-20" aria-hidden />,
  },
)

const InstagramCarousel = dynamic(
  () => import('@/components/instagram-embed').then((m) => m.InstagramCarousel),
  {
    loading: () => (
      <div className="mx-auto h-[490px] w-full max-w-5xl rounded-2xl bg-secondary/40" aria-hidden />
    ),
  },
)

export const revalidate = 120

export default async function HomePage() {
  const [featured, categories, carouselReels, heroImages] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getCarouselVideoUrls(),
    getHeroImages(),
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

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:gap-12 md:py-24">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <Logo size="lg" className="md:h-36 md:w-36" priority />
            <div className="mt-6">
              <h1 className="font-serif text-4xl font-light tracking-wide text-foreground md:text-5xl">
                Water of Cold Parfume
              </h1>
              <p className="mt-3 text-[11px] font-light tracking-[0.4em] text-primary">
                PARFUMS &middot; MAQUILLAGE &middot; SACS &middot; SOINS
              </p>
              <p className="mt-4 text-sm font-light tracking-widest text-muted-foreground">TUNISIE</p>
            </div>
            <p className="mt-6 max-w-md text-base font-light leading-relaxed text-muted-foreground">
              Votre boutique Water of Cold Parfume pour parfums, maquillage, sacs et soins. Des produits choisis avec amour pour
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
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-border/60 shadow-sm shadow-primary/10">
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
            <div className="space-y-3 pt-8 md:space-y-4 md:pt-12">
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
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-border/60 shadow-sm shadow-primary/10">
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
        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="mb-12 text-center">
            <p className="text-[10px] font-light tracking-[0.4em] text-primary">SELECTION</p>
            <h2 className="mt-2 font-serif text-3xl font-light tracking-widest text-foreground">COUPS DE COEUR</h2>
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
          <InstagramCarousel reels={carouselReels} />
          <InstagramFollowButton />
        </div>
      </section>
    </div>
  )
}
