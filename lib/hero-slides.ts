export const HERO_CTA_TARGETS = [
  { value: 'promotions', label: 'Promotions', href: '#promotions' },
  { value: 'nouveautes', label: 'Derniers articles', href: '#nouveautes' },
  { value: 'best-sellers', label: 'Les plus vendus', href: '#best-sellers' },
  { value: 'products', label: 'Toute la boutique', href: '/products' },
  { value: 'custom', label: 'Lien personnalise', href: '' },
] as const

export type HeroCtaTarget = (typeof HERO_CTA_TARGETS)[number]['value']

export type HeroSlide = {
  id: number
  imageUrl: string
  alt: string
  eyebrow: string
  title: string
  subtitle: string
  ctaLabel: string
  ctaTarget: HeroCtaTarget
  ctaHref: string
  published: boolean
  sortOrder: number
}

export function isHeroCtaTarget(value: string): value is HeroCtaTarget {
  return HERO_CTA_TARGETS.some((target) => target.value === value)
}

export function resolveHeroCtaHref(slide: {
  ctaTarget: string
  ctaHref?: string | null
}): string {
  if (slide.ctaTarget === 'custom') {
    const href = slide.ctaHref?.trim() ?? ''
    return href || '/products'
  }

  return HERO_CTA_TARGETS.find((target) => target.value === slide.ctaTarget)?.href ?? '/products'
}

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 0,
    imageUrl: '/assets/banner1.webp',
    alt: 'Optimisez votre espace — rangement Deco Shop Plus',
    eyebrow: 'Offre du moment',
    title: 'Promotions maison',
    subtitle: 'Housses, coussins et rangement a prix reduit, livrés partout en Tunisie.',
    ctaLabel: 'Voir les promotions',
    ctaTarget: 'promotions',
    ctaHref: '',
    published: true,
    sortOrder: 0,
  },
  {
    id: 1,
    imageUrl: '/assets/banner2.webp',
    alt: 'Sac de voyage Zip&GO Deco Shop Plus',
    eyebrow: 'Cite El Waha · Bizerte',
    title: 'Derniers articles',
    subtitle: 'Les nouvelles pieces deco viennent d arriver en boutique.',
    ctaLabel: 'Voir les nouveautes',
    ctaTarget: 'nouveautes',
    ctaHref: '',
    published: true,
    sortOrder: 1,
  },
]
