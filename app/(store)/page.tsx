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
import { getStorefrontI18n } from '@/lib/i18n/get-locale'
import { localizeCategories } from '@/lib/i18n/categories'
import { SITE, SITE_KEYWORDS } from '@/lib/site'
import { JsonLd } from '@/components/json-ld'
import { StoreFaq } from '@/components/store-faq'
import { faqJsonLd, homePageJsonLd, pageAlternates } from '@/lib/seo'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Suspense, type ReactNode } from 'react'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getStorefrontI18n()
  const title = dict.home.title(SITE.name, dict.site.neighborhood, dict.site.city)
  return {
    title: { absolute: title },
    description: dict.site.description,
    keywords: [SITE.name, ...dict.site.keywords, ...SITE_KEYWORDS],
    alternates: pageAlternates('/'),
    openGraph: {
      title,
      description: dict.site.description,
      url: '/',
    },
  }
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
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
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
  const [{ dict }, categories] = await Promise.all([getStorefrontI18n(), getCategories()])
  return <CategoriesSection categories={localizeCategories(mergeStoreCategories(categories), dict)} />
}

async function HomePromotions() {
  const [{ dict }, products, categories] = await Promise.all([
    getStorefrontI18n(),
    getPromoProducts(),
    getCategories(),
  ])
  return (
    <HomeProductSection
      id="promotions"
      eyebrow={dict.home.offers}
      title={dict.home.promotions}
      products={products}
      categories={localizeCategories(mergeStoreCategories(categories), dict)}
    />
  )
}

async function HomeLatest() {
  const [{ dict }, products, categories] = await Promise.all([
    getStorefrontI18n(),
    getLatestProducts(),
    getCategories(),
  ])
  return (
    <HomeProductSection
      id="nouveautes"
      eyebrow={dict.home.arrivals}
      title={dict.home.latest}
      products={products}
      categories={localizeCategories(mergeStoreCategories(categories), dict)}
    />
  )
}

async function HomeBestSellers() {
  const [{ dict }, products, categories] = await Promise.all([
    getStorefrontI18n(),
    getBestSellerProducts(),
    getCategories(),
  ])
  return (
    <HomeProductSection
      id="best-sellers"
      eyebrow={dict.home.clientsPick}
      title={dict.home.bestSellers}
      products={products}
      categories={localizeCategories(mergeStoreCategories(categories), dict)}
    />
  )
}

async function HomeFeatured() {
  const [{ dict }, products, categories] = await Promise.all([
    getStorefrontI18n(),
    getFeaturedProducts(),
    getCategories(),
  ])
  return (
    <HomeProductSection
      id="coups-de-coeur"
      eyebrow={dict.home.selection}
      title={dict.home.favorites}
      products={products}
      categories={localizeCategories(mergeStoreCategories(categories), dict)}
      action={
        <Link
          href="/products"
          className="inline-flex min-h-11 items-center rounded-full border border-border px-8 py-3 text-sm font-medium text-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
        >
          {dict.home.allShop}
        </Link>
      }
    />
  )
}

export default async function HomePage() {
  const { dict, locale } = await getStorefrontI18n()
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

      <StoreFaq />
      <JsonLd data={homePageJsonLd(dict, locale)} />
      <JsonLd data={faqJsonLd(dict)} />

      <section className="below-fold border-t border-border bg-secondary/40 py-14 md:py-16">
        <div className="mx-auto max-w-7xl px-2 sm:px-3">
          <InstagramSectionHeader />
          <InstagramFollowButton />
        </div>
      </section>
    </div>
  )
}
