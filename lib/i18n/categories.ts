import type { Dictionary } from '@/lib/i18n/dictionary'
import type { StoreCategory } from '@/lib/store-categories'

export function categoryCopy(dict: Dictionary, slug: string) {
  const entry = dict.categories[slug]
  if (entry && typeof entry === 'object') return entry
  return null
}

export function localizeCategories(categories: StoreCategory[], dict: Dictionary): StoreCategory[] {
  return categories.map((category) => {
    const copy = categoryCopy(dict, category.slug)
    if (!copy) return category
    return { ...category, name: copy.name, tagline: copy.tagline }
  })
}

export function localizeCategoryLabel(slug: string, fallback: string, dict: Dictionary) {
  return categoryCopy(dict, slug)?.name ?? fallback
}
