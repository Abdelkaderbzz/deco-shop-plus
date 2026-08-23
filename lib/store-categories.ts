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
    tagline: 'Galettes de chaise et coussins',
    image: '/assets/chair-pad-stack.webp',
  },
  {
    slug: 'accessoires',
    name: 'Accessoires',
    tagline: 'Objets déco pour la maison',
    image: '/assets/chair-pad-lifestyle.webp',
  },
  {
    slug: 'rangement',
    name: 'Rangement',
    tagline: 'Organisation des vêtements et de la maison',
    image: '/assets/sr01.webp',
  },
]

/** @deprecated Prefer getHeroImages() from app/actions/hero — kept for showcase gallery refs. */
export const HERO_IMAGES = [
  { src: '/assets/chair-pad-lifestyle.webp', alt: 'Galette de chaise Deco Shop Plus' },
  { src: '/assets/sr01-angle.webp', alt: 'Sac de rangement SR01' },
  { src: '/assets/hc01.webp', alt: 'Housses a chaussures HC01' },
  { src: '/assets/chair-pad-stack.webp', alt: 'Galettes de chaise' },
]

export type ShowcaseImage = {
  src: string
  alt: string
  category: string
}

export const SHOWCASE_GALLERY: ShowcaseImage[] = [
  { src: '/assets/chair-pad-stack.webp', alt: 'Galettes de chaise', category: 'coussins' },
  { src: '/assets/chair-pad-red.webp', alt: 'Galette de chaise rouge', category: 'coussins' },
  { src: '/assets/chair-pad-lifestyle.webp', alt: 'Galette de chaise en situation', category: 'coussins' },
  { src: '/assets/sr01.webp', alt: 'Sac de rangement SR01', category: 'rangement' },
  { src: '/assets/hc01.webp', alt: 'Housses a chaussures HC01', category: 'rangement' },
  { src: '/assets/sr01-filled.webp', alt: 'Sac de rangement rempli', category: 'rangement' },
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

const RETIRED_CATEGORY_SLUGS = new Set(['textiles', 'femme', 'homme', 'parfums', 'maquillage', 'sacs', 'soins', 'unisex', 'tous'])

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
    .filter(
      (category) =>
        !STORE_CATEGORIES.some((item) => item.slug === category.slug) &&
        !RETIRED_CATEGORY_SLUGS.has(category.slug),
    )
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
