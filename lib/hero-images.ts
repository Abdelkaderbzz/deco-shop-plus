export const HERO_SLOT_COUNT = 4

export type HeroImageSlot = {
  slot: number
  imageUrl: string
  alt: string
  /** Short label for admin UI */
  label: string
  /** Aspect hint shown in admin */
  shape: 'tall' | 'square'
  position: string
}

/** Defaults match the homepage collage layout (top-left, top-right, bottom-left, bottom-right). */
export const DEFAULT_HERO_IMAGES: HeroImageSlot[] = [
  {
    slot: 0,
    imageUrl: '/assets/img_9756-1.webp',
    alt: 'Coussins brodes sur banquette Deco Shop Plus',
    label: 'Haut gauche',
    shape: 'tall',
    position: 'Colonne gauche, image haute',
  },
  {
    slot: 1,
    imageUrl: '/assets/photo-output-1-2.jpeg.webp',
    alt: 'Coussins noirs sur canape',
    label: 'Haut droite',
    shape: 'square',
    position: 'Colonne droite, image carree',
  },
  {
    slot: 2,
    imageUrl: '/assets/img_9760.webp',
    alt: 'Coussin brode floral',
    label: 'Bas gauche',
    shape: 'square',
    position: 'Colonne gauche, image carree',
  },
  {
    slot: 3,
    imageUrl: '/assets/IMG_4758-1536x2048.jpeg.webp',
    alt: 'Plaid marine et deco maison',
    label: 'Bas droite',
    shape: 'tall',
    position: 'Colonne droite, image haute',
  },
]

export function mergeHeroImages(
  rows: { slot: number; imageUrl: string; alt: string }[],
): HeroImageSlot[] {
  const bySlot = new Map(rows.map((row) => [row.slot, row]))

  return DEFAULT_HERO_IMAGES.map((fallback) => {
    const row = bySlot.get(fallback.slot)
    if (!row?.imageUrl) return fallback
    return {
      ...fallback,
      imageUrl: row.imageUrl,
      alt: row.alt?.trim() || fallback.alt,
    }
  })
}
