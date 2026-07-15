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
    image: '/categories/parfums.png',
  },
  {
    slug: 'maquillage',
    name: 'Maquillage',
    tagline: 'Levres, teint & palettes',
    image: '/categories/maquillage.png',
  },
  {
    slug: 'sacs',
    name: 'Sacs',
    tagline: 'Sacs a main & accessoires',
    image: '/categories/sacs.png',
  },
  {
    slug: 'soins',
    name: 'Soins',
    tagline: 'Corps, cheveux & bien-etre',
    image: '/categories/soins.png',
  },
]

export const HERO_IMAGES = [
  { src: '/hero/perfume-1.png', alt: 'Parfums feminins' },
  { src: '/hero/makeup-1.png', alt: 'Maquillage luxe' },
  { src: '/hero/perfume-2.png', alt: 'Eau de parfum' },
  { src: '/hero/bag-1.png', alt: 'Sacs a main' },
  { src: '/hero/makeup-2.png', alt: 'Maquillage' },
]

export type ShowcaseImage = {
  src: string
  alt: string
  category: string
}

export const SHOWCASE_GALLERY: ShowcaseImage[] = [
  { src: '/showcase/perfume-3.png', alt: 'Collection parfums MATCH', category: 'parfums' },
  { src: '/showcase/perfume-4.png', alt: 'Parfum Kayali', category: 'parfums' },
  { src: '/showcase/perfume-5.png', alt: 'Coffret parfums', category: 'parfums' },
  { src: '/showcase/perfume-6.png', alt: 'Eau de parfum feminin', category: 'parfums' },
  { src: '/showcase/perfume-7.png', alt: 'Fragrance de luxe', category: 'parfums' },
  { src: '/showcase/perfume-8.png', alt: 'Parfum signature', category: 'parfums' },
  { src: '/categories/parfums.png', alt: 'Coffret Lattafa Yara', category: 'parfums' },
  { src: '/showcase/makeup-3.png', alt: 'Palette maquillage', category: 'maquillage' },
  { src: '/categories/maquillage.png', alt: 'Blush Dior Rosy Glow', category: 'maquillage' },
  { src: '/hero/makeup-1.png', alt: 'Rouge a levres Dior', category: 'maquillage' },
  { src: '/hero/makeup-2.png', alt: 'Gloss KIKO Milano', category: 'maquillage' },
  { src: '/categories/sacs.png', alt: 'Sac Dior', category: 'sacs' },
  { src: '/hero/bag-1.png', alt: 'Sac a main luxe', category: 'sacs' },
  { src: '/categories/soins.png', alt: 'Set Victoria Secret Bare Vanilla', category: 'soins' },
  { src: '/showcase/soins-2.png', alt: 'Soins corps', category: 'soins' },
  { src: '/showcase/soins-3.png', alt: 'Coffret soins Enchanteur', category: 'soins' },
  { src: '/hero/perfume-1.png', alt: 'Parfum IBRAQ', category: 'parfums' },
  { src: '/hero/perfume-2.png', alt: 'Kayali Vanilla Candy', category: 'parfums' },
]

export function getShowcaseByCategory(category: string) {
  return SHOWCASE_GALLERY.filter((img) => img.category === category)
}

export function getCategoryBySlug(slug: string) {
  return STORE_CATEGORIES.find((c) => c.slug === slug)
}

export function getCategoryLabel(slug: string, categories?: { slug: string; name: string }[]) {
  const fromDb = categories?.find((c) => c.slug === slug)
  if (fromDb) return fromDb.name
  return getCategoryBySlug(slug)?.name ?? slug
}
