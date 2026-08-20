import { CategoryCard } from '@/components/category-card'
import { Reveal } from '@/components/reveal'
import type { StoreCategory } from '@/lib/store-categories'

export function CategoriesSection({ categories }: { categories: StoreCategory[] }) {
  return (
    <section className="border-t border-border bg-secondary/35 py-14 md:py-16">
      <div className="mx-auto max-w-7xl px-2 sm:px-3">
        <Reveal className="mb-10 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-primary">Univers</p>
          <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight text-foreground">
            Pour la maison
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
            Coussins, accessoires, rangement et literie choisis a Bizerte.
          </p>
        </Reveal>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </div>
    </section>
  )
}
