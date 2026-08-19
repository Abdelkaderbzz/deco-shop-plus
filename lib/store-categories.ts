export type StoreCategory = {
  slug: string
  name: string
  tagline: string
  image: string
}

export const STORE_CATEGORIES: StoreCategory[] = [
  {
    slug: 'coussins',
    name: 'Coussins',
    tagline: 'Coussins pour canape, lit et salon',
    image: '/assets/img_9760.webp',
  },
  {
    slug: 'accessoires',
    name: 'Accessoires',
    tagline: 'Objets deco pour la maison',
    image: '/assets/image00001-2-1537x2048.jpeg.webp',
  },
  {
    slug: 'rangement',
    name: 'Rangement',
    tagline: 'Organisation des vetements et de la maison',
    image: '/assets/photo-output-12-1538x2048.jpeg.webp',
  },
  {
    slug: 'textiles',
    name: 'Literie',
    tagline: 'Plaids, couvre-lits et linge de maison',
    image: '/assets/IMG_4758-1536x2048.jpeg.webp',
  },
]

/** @deprecated Prefer getHeroImages() from app/actions/hero — kept for showcase gallery refs. */
export const HERO_IMAGES = [
  { src: '/assets/img_9756-1.webp', alt: 'Coussins Deco Shop Plus' },
  { src: '/assets/photo-output-1-2.jpeg.webp', alt: 'Salon Deco Shop Plus' },
  { src: '/assets/img_9760.webp', alt: 'Coussin brode' },
  { src: '/assets/IMG_4758-1536x2048.jpeg.webp', alt: 'Plaid marine' },
]

export type ShowcaseImage = {
  src: string
  alt: string
  category: string
}

export const SHOWCASE_GALLERY: ShowcaseImage[] = [
  { src: '/assets/img_9760.webp', alt: 'Coussin brode floral', category: 'coussins' },
  { src: '/assets/img_9758.webp', alt: 'Coussins salon', category: 'coussins' },
  { src: '/assets/img_9756-1.webp', alt: 'Banquette coussins', category: 'coussins' },
  { src: '/assets/image00001-2-1537x2048.jpeg.webp', alt: 'Fauteuil et coussin', category: 'accessoires' },
  { src: '/assets/photo-output-12-1538x2048.jpeg.webp', alt: 'Coussins canape', category: 'rangement' },
  { src: '/assets/IMG_4758-1536x2048.jpeg.webp', alt: 'Plaid marine', category: 'textiles' },
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
