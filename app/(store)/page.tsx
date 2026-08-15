import { getBoutiques } from '@/app/actions/boutiques'
import { getCategories } from '@/app/actions/categories'
import { getHeroImages } from '@/app/actions/hero'
import { getFeaturedProducts } from '@/app/actions/products'
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

export const revalidate = 120

export default async function HomePage() {
  const [featured, categories, heroImages, boutiques] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getHeroImages(),
    getBoutiques(),
  ])
  const storeCategories = mergeStoreCategories(categories)

  return (
    <div>
      <HeroSection images={heroImages} />

      <CategoriesSection categories={storeCategories} />

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12 md:py-14">
          <Reveal className="mb-8 text-center">
            <p className="text-[10px] font-light tracking-[0.4em] text-primary">SELECTION</p>
            <h2 className="mt-2 font-serif text-2xl font-light tracking-widest text-foreground">COUPS DE COEUR</h2>
          </Reveal>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {featured.map((product, index) => (
              <Reveal key={product.id} delay={(index % 4) * 80}>
                <ProductCard product={product} categories={categories} />
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-8 text-center" delay={120}>
            <Link
              href="/products"
              className="rounded-full border border-border px-8 py-2.5 text-[11px] font-light tracking-[0.3em] text-muted-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
            >
              TOUTE LA BOUTIQUE
            </Link>
          </Reveal>
        </section>
      )}

      <TestimonialsSection />

      <BoutiquesSection boutiques={boutiques} />

      {/* Instagram */}
      <section className="border-t border-border bg-secondary/30 py-12 md:py-14">
        <div className="mx-auto max-w-6xl px-4">
          <InstagramSectionHeader />
          <Reveal delay={80}>
            <InstagramFollowButton />
          </Reveal>
        </div>
      </section>
    </div>
  )
}
