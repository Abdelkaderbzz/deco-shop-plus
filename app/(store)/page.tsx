import { getBoutiques } from '@/app/actions/boutiques'
import { getCategories } from '@/app/actions/categories'
import { getHeroSlides } from '@/app/actions/hero'
import {
  getBestSellerProducts,
  getFeaturedProducts,
  getLatestProducts,
  getPromoProducts,
} from '@/app/actions/products'
import { BoutiquesSection } from '@/components/boutiques-section'
import { CategoriesSection } from '@/components/categories-section'
import { HeroSection } from '@/components/hero-section'
import { ProductCard } from '@/components/product-card'
import {
  InstagramFollowButton,
  InstagramSectionHeader,
} from '@/components/instagram-section-static'
import { Reveal } from '@/components/reveal'
import { TestimonialsSection } from '@/components/testimonials-section'
import { mergeStoreCategories } from '@/lib/store-categories'
import Link from 'next/link'
import type { ReactNode } from 'react'

export const revalidate = 120

function HomeProductSection({
  id,
  eyebrow,
  title,
  products,
  categories,
  action,
}: {
  id: string
  eyebrow: string
  title: string
  products: Parameters<typeof ProductCard>[0]['product'][]
  categories: { slug: string; name: string }[]
  action?: ReactNode
}) {
  if (products.length === 0) return null

  return (
    <section id={id} className="scroll-mt-24 mx-auto max-w-7xl px-2 py-14 sm:px-3 md:py-16">
      <Reveal className="mb-10 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-primary">{eyebrow}</p>
        <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight text-foreground">
          {title}
        </h2>
      </Reveal>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {products.map((product, index) => (
          <Reveal key={product.id} delay={(index % 4) * 80}>
            <ProductCard product={product} categories={categories} />
          </Reveal>
        ))}
      </div>
      {action ? (
        <Reveal className="mt-10 text-center" delay={120}>
          {action}
        </Reveal>
      ) : null}
    </section>
  )
}

export default async function HomePage() {
  const [featured, promotions, latest, bestSellers, categories, heroSlides, boutiques] =
    await Promise.all([
      getFeaturedProducts(),
      getPromoProducts(),
      getLatestProducts(),
      getBestSellerProducts(),
      getCategories(),
      getHeroSlides(),
      getBoutiques(),
    ])
  const storeCategories = mergeStoreCategories(categories)

  return (
    <div>
      <HeroSection slides={heroSlides} />

      <CategoriesSection categories={storeCategories} />

      <HomeProductSection
        id="promotions"
        eyebrow="Offres"
        title="Promotions"
        products={promotions}
        categories={categories}
      />

      <HomeProductSection
        id="nouveautes"
        eyebrow="Arrivees"
        title="Derniers articles"
        products={latest}
        categories={categories}
      />

      <HomeProductSection
        id="best-sellers"
        eyebrow="Selection clients"
        title="Les plus vendus"
        products={bestSellers}
        categories={categories}
      />

      {featured.length > 0 && (
        <HomeProductSection
          id="coups-de-coeur"
          eyebrow="Selection"
          title="Coups de coeur"
          products={featured}
          categories={categories}
          action={
            <Link
              href="/products"
              className="rounded-full border border-border px-8 py-3 text-sm font-medium text-muted-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
            >
              Toute la boutique
            </Link>
          }
        />
      )}

      <TestimonialsSection />

      <BoutiquesSection boutiques={boutiques} />

      <section className="border-t border-border bg-secondary/40 py-14 md:py-16">
        <div className="mx-auto max-w-7xl px-2 sm:px-3">
          <InstagramSectionHeader />
          <Reveal delay={80}>
            <InstagramFollowButton />
          </Reveal>
        </div>
      </section>
    </div>
  )
}
