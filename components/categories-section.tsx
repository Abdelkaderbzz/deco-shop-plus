import { CategoryCard } from '@/components/category-card'
import { Reveal } from '@/components/reveal'
import type { StoreCategory } from '@/lib/store-categories'

export function CategoriesSection({ categories }: { categories: StoreCategory[] }) {
  return (
    <section className="border-t border-border bg-secondary/20 py-12 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="mb-8 text-center">
          <p className="text-[10px] font-light tracking-[0.4em] text-primary">NOS UNIVERS</p>
          <h2 className="mt-2 font-serif text-2xl font-light tracking-widest text-foreground">
            NOS PARFUMS
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm font-light text-muted-foreground">
            Fragrances inspirees et de longue tenue, pour femmes et hommes.
          </p>
        </Reveal>

        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4">
          {categories.map((category, index) => (
            <Reveal key={category.slug} variant="zoom" delay={index * 90}>
              <CategoryCard category={category} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
