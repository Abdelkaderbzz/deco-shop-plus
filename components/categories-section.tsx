import { CategoryCard } from '@/components/category-card'
import { STORE_CATEGORIES } from '@/lib/store-categories'

export function CategoriesSection() {
  return (
    <section className="border-t border-border bg-secondary/20 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-12 text-center">
          <p className="text-[10px] font-light tracking-[0.4em] text-primary">NOS UNIVERS</p>
          <h2 className="mt-2 font-serif text-3xl font-light tracking-widest text-foreground">
            TOUTE VOTRE BEAUTE
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm font-light text-muted-foreground">
            Parfums, maquillage, sacs et soins selectionnes pour sublimer votre quotidien.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {STORE_CATEGORIES.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </div>
    </section>
  )
}
