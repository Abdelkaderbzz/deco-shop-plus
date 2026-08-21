import { getCategories } from '@/app/actions/categories'
import { getHeroSlides } from '@/app/actions/hero'
import {
  getBestSellerProducts,
  getFeaturedProducts,
  getLatestProducts,
  getPromoProducts,
} from '@/app/actions/products'
import { CategoriesSection } from '@/components/categories-section'
import { HeroSection } from '@/components/hero-section'
import { ProductCard } from '@/components/product-card'
import {
  InstagramFollowButton,
  InstagramSectionHeader,
} from '@/components/instagram-section-static'
import {
  CategoriesSkeleton,
  HeroSkeleton,
  ProductGridSkeleton,
} from '@/components/store-skeletons'
import { TestimonialsSection } from '@/components/testimonials-section'
import { mergeStoreCategories } from '@/lib/store-categories'
import { SITE } from '@/lib/site'
import { pageAlternates } from '@/lib/seo'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Suspense, type ReactNode } from 'react'

export const revalidate = 120

export const metadata: Metadata = {
  title: { absolute: `${SITE.name} | Décoration à ${SITE.neighborhood}, ${SITE.city}` },
  description: SITE.description,
  alternates: pageAlternates('/'),
  openGraph: {
    title: `${SITE.name} | Décoration à ${SITE.neighborhood}, ${SITE.city}`,
    description: SITE.description,
    url: '/',
  },
}

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
    <section id={id} className="below-fold scroll-mt-24 mx-auto max-w-7xl px-2 py-14 sm:px-3 md:py-16">
      <div className="mb-10 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-primary">{eyebrow}</p>
        <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight text-foreground">
          {title}
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} categories={categories} />
        ))}
      </div>
      {action ? <div className="mt-10 text-center">{action}</div> : null}
    </section>
  )
}

async function HomeHero() {
  const slides = await getHeroSlides()
  return <HeroSection slides={slides} />
}

async function HomeCategories() {
  const categories = await getCategories()
  return <CategoriesSection categories={mergeStoreCategories(categories)} />
}

async function HomePromotions() {
  const [products, categories] = await Promise.all([getPromoProducts(), getCategories()])
  return (
    <HomeProductSection
      id="promotions"
      eyebrow="Offres"
      title="Promotions"
      products={products}
      categories={categories}
    />
  )
}

async function HomeLatest() {
  const [products, categories] = await Promise.all([getLatestProducts(), getCategories()])
  return (
    <HomeProductSection
      id="nouveautes"
      eyebrow="Arrivees"
      title="Derniers articles"
      products={products}
      categories={categories}
    />
  )
}

async function HomeBestSellers() {
  const [products, categories] = await Promise.all([getBestSellerProducts(), getCategories()])
  return (
    <HomeProductSection
      id="best-sellers"
      eyebrow="Selection clients"
      title="Les plus vendus"
      products={products}
      categories={categories}
    />
  )
}

async function HomeFeatured() {
  const [products, categories] = await Promise.all([getFeaturedProducts(), getCategories()])
  return (
    <HomeProductSection
      id="coups-de-coeur"
      eyebrow="Selection"
      title="Coups de coeur"
      products={products}
      categories={categories}
      action={
        <Link
          href="/products"
          className="inline-flex min-h-11 items-center rounded-full border border-border px-8 py-3 text-sm font-medium text-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
        >
          Toute la boutique
        </Link>
      }
    />
  )
}

export default function HomePage() {
  return (
    <div>
      <Suspense fallback={<HeroSkeleton />}>
        <HomeHero />
      </Suspense>

      <Suspense fallback={<CategoriesSkeleton />}>
        <HomeCategories />
      </Suspense>

      <Suspense fallback={<ProductGridSkeleton count={4} />}>
        <HomePromotions />
      </Suspense>

      <Suspense fallback={<ProductGridSkeleton count={4} />}>
        <HomeLatest />
      </Suspense>

      <Suspense fallback={<ProductGridSkeleton count={4} />}>
        <HomeBestSellers />
      </Suspense>

      <Suspense fallback={<ProductGridSkeleton count={4} />}>
        <HomeFeatured />
      </Suspense>

      <TestimonialsSection />

      <section className="below-fold border-t border-border bg-secondary/40 py-14 md:py-16">
        <div className="mx-auto max-w-7xl px-2 sm:px-3">
          <InstagramSectionHeader />
          <InstagramFollowButton />
        </div>
      </section>
    </div>
  )
}
