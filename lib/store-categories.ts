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
    tagline: 'Galettes de chaise et coussins en velours anti-tache',
    image: '/assets/chair-pad-stack.webp',
  },
]

/** @deprecated Prefer getHeroImages() from app/actions/hero — kept for showcase gallery refs. */
export const HERO_IMAGES = [
  { src: '/assets/chair-pad-lifestyle.webp', alt: 'Galette de chaise Deco Shop Plus' },
  { src: '/assets/reading-pillow-colors.webp', alt: 'Coussin de lecture' },
  { src: '/assets/sofa-cushion-colors.webp', alt: 'Coussin de canape' },
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
  { src: '/assets/sofa-cushion-colors.webp', alt: 'Coussin de canape', category: 'coussins' },
  { src: '/assets/reading-pillow-colors.webp', alt: 'Coussin de lecture', category: 'coussins' },
  { src: '/assets/headboard-cushion-colors.webp', alt: 'Coussin de tete de lit', category: 'coussins' },
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

const RETIRED_CATEGORY_SLUGS = new Set(['textiles', 'accessoires', 'rangement', 'femme', 'homme', 'parfums', 'maquillage', 'sacs', 'soins', 'unisex', 'tous'])

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
