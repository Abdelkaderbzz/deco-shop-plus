'use client'

import { CategoryCard } from '@/components/category-card'
import { useI18n } from '@/lib/i18n/provider'
import type { StoreCategory } from '@/lib/store-categories'

export function CategoriesSection({ categories }: { categories: StoreCategory[] }) {
  const { dict } = useI18n()
  return (
    <section className="below-fold border-t border-border bg-secondary/35 py-14 md:py-16">
      <div className="mx-auto max-w-7xl px-2 sm:px-3">
        <div className="mb-10 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-primary">{dict.home.universe}</p>
          <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight text-foreground">
            {dict.home.forTheHome}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
            {dict.home.categoriesSubtitle}
          </p>
        </div>

        <div
          className={
            categories.length === 1
              ? 'mx-auto max-w-[11rem] sm:max-w-[13rem]'
              : 'mx-auto grid max-w-md grid-cols-2 gap-3 sm:max-w-lg sm:gap-4'
          }
        >
          {categories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </div>
    </section>
  )
}
