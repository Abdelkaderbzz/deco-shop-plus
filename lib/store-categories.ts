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
  { src: '/showcase/perfume-3.webp', alt: 'Collection parfums MATCH', category: 'parfums' },
  { src: '/showcase/perfume-4.webp', alt: 'Parfum Kayali', category: 'parfums' },
  { src: '/showcase/perfume-5.webp', alt: 'Coffret parfums', category: 'parfums' },
  { src: '/showcase/perfume-6.webp', alt: 'Eau de parfum feminin', category: 'parfums' },
  { src: '/showcase/perfume-7.webp', alt: 'Fragrance de luxe', category: 'parfums' },
  { src: '/showcase/perfume-8.webp', alt: 'Parfum signature', category: 'parfums' },
  { src: '/categories/parfums.webp', alt: 'Coffret Lattafa Yara', category: 'parfums' },
  { src: '/showcase/makeup-3.webp', alt: 'Palette maquillage', category: 'maquillage' },
  { src: '/categories/maquillage.webp', alt: 'Blush Dior Rosy Glow', category: 'maquillage' },
  { src: '/hero/makeup-1.webp', alt: 'Rouge a levres Dior', category: 'maquillage' },
  { src: '/hero/makeup-2.webp', alt: 'Gloss KIKO Milano', category: 'maquillage' },
  { src: '/categories/sacs.webp', alt: 'Sac Dior', category: 'sacs' },
  { src: '/hero/bag-1.webp', alt: 'Sac a main luxe', category: 'sacs' },
  { src: '/categories/soins.webp', alt: 'Set Victoria Secret Bare Vanilla', category: 'soins' },
  { src: '/showcase/soins-2.webp', alt: 'Soins corps', category: 'soins' },
  { src: '/showcase/soins-3.webp', alt: 'Coffret soins Enchanteur', category: 'soins' },
  { src: '/hero/perfume-1.webp', alt: 'Parfum IBRAQ', category: 'parfums' },
  { src: '/hero/perfume-2.webp', alt: 'Kayali Vanilla Candy', category: 'parfums' },
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
