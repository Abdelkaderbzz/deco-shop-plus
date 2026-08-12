export type StoreCategory = {
  slug: string
  name: string
  tagline: string
  image: string
}

export const STORE_CATEGORIES: StoreCategory[] = [
  {
    slug: 'parfums',
    name: 'Parfums',
    tagline: 'Fragrances feminines & coffrets',
    image: '/categories/parfums.webp',
  },
  {
    slug: 'maquillage',
    name: 'Maquillage',
    tagline: 'Levres, teint & palettes',
    image: '/categories/maquillage.webp',
  },
  {
    slug: 'sacs',
    name: 'Sacs',
    tagline: 'Sacs a main & accessoires',
    image: '/categories/sacs.webp',
  },
  {
    slug: 'soins',
    name: 'Soins',
    tagline: 'Corps, cheveux & bien-etre',
    image: '/categories/soins.webp',
  },
]

/** @deprecated Prefer getHeroImages() from app/actions/hero — kept for showcase gallery refs. */
export const HERO_IMAGES = [
  { src: '/hero/perfume-1.webp', alt: 'Parfums feminins' },
  { src: '/hero/makeup-1.webp', alt: 'Maquillage luxe' },
  { src: '/hero/perfume-2.webp', alt: 'Eau de parfum' },
  { src: '/hero/bag-1.webp', alt: 'Sacs a main' },
  { src: '/hero/makeup-2.webp', alt: 'Maquillage' },
]

export type ShowcaseImage = {
  src: string
  alt: string
  category: string
}

export const SHOWCASE_GALLERY: ShowcaseImage[] = [
  { src: '/showcase/perfume-4.png', alt: 'Lattafa Yara', category: 'parfums' },
  { src: '/categories/parfums.webp', alt: 'Coffret Lattafa Yara', category: 'parfums' },
  { src: '/categories/maquillage.webp', alt: 'Maquillage', category: 'maquillage' },
  { src: '/hero/makeup-1.webp', alt: 'Rouge a levres', category: 'maquillage' },
  { src: '/hero/makeup-2.webp', alt: 'Gloss', category: 'maquillage' },
  { src: '/categories/sacs.webp', alt: 'Sacs', category: 'sacs' },
  { src: '/hero/bag-1.webp', alt: 'Sac a main luxe', category: 'sacs' },
  { src: '/categories/soins.webp', alt: 'Soins', category: 'soins' },
  { src: '/hero/perfume-1.webp', alt: 'Parfum', category: 'parfums' },
  { src: '/hero/perfume-2.webp', alt: 'Fragrance', category: 'parfums' },
]

export function getShowcaseByCategory(category: string) {
  return SHOWCASE_GALLERY.filter((img) => img.category === category)
}

export function getCategoryBySlug(slug: string) {
  return STORE_CATEGORIES.find((c) => c.slug === slug)
}

export type DbCategory = {
  slug: string
  name: string
  bannerUrl?: string | null
}

export function mergeStoreCategories(dbCategories: DbCategory[]): StoreCategory[] {
  const dbBySlug = new Map(dbCategories.map((category) => [category.slug, category]))

  const fromDefaults = STORE_CATEGORIES.map((category) => {
    const fromDb = dbBySlug.get(category.slug)
    return {
      ...category,
      name: fromDb?.name ?? category.name,
      image: fromDb?.bannerUrl ?? category.image,
    }
  })

  const extras = dbCategories
    .filter((category) => !STORE_CATEGORIES.some((item) => item.slug === category.slug))
    .map((category) => ({
      slug: category.slug,
      name: category.name,
      tagline: category.name,
      image: category.bannerUrl ?? '',
    }))

  return [...fromDefaults, ...extras]
}

export function getMergedCategoryBySlug(slug: string, dbCategories: DbCategory[]) {
  return mergeStoreCategories(dbCategories).find((category) => category.slug === slug)
}

export function getCategoryLabel(slug: string, categories?: { slug: string; name: string }[]) {
  const fromDb = categories?.find((c) => c.slug === slug)
  if (fromDb) return fromDb.name
  return getCategoryBySlug(slug)?.name ?? slug
}
