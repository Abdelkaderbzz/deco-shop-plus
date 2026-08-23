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
    imageUrl: '/assets/campaign-atelier.webp',
    alt: 'Atelier Deco Shop Plus a Cite El Waha, Bizerte',
    eyebrow: 'Cité El Waha · Bizerte',
    title: 'Un atelier. Des coussins.',
    subtitle:
      'Nous concevons et cousons nos pièces à Bizerte, avec des matières choisies et du temps.',
    ctaLabel: 'Entrer dans la boutique',
    ctaTarget: 'products',
    ctaHref: '',
    published: true,
    sortOrder: 0,
  },
  {
    id: 1,
    imageUrl: '/assets/campaign-matiere.webp',
    alt: 'Velours et tissus Deco Shop Plus',
    eyebrow: 'Matières',
    title: 'Le velours, le confort, la couleur',
    subtitle: 'Des tissus denses, des finitions soignées — pour le salon comme pour le lit.',
    ctaLabel: 'Voir les coussins',
    ctaTarget: 'custom',
    ctaHref: '/categorie/coussins',
    published: true,
    sortOrder: 1,
  },
  {
    id: 2,
    imageUrl: '/assets/campaign-couleurs.webp',
    alt: 'Couleurs de l atelier Deco Shop Plus',
    eyebrow: "L'offre de l'atelier",
    title: 'Quatre galettes, une table',
    subtitle: 'Un pack pour habiller la salle à manger, aux couleurs que vous choisissez.',
    ctaLabel: "Voir l'offre",
    ctaTarget: 'custom',
    ctaHref: '/products/25',
    published: true,
    sortOrder: 2,
  },
  {
    id: 3,
    imageUrl: '/assets/campaign-maison.webp',
    alt: 'Maison et lecture, univers Deco Shop Plus',
    eyebrow: 'Maison',
    title: "S'installer. Lire. Rester.",
    subtitle: 'Des pièces pensées pour le quotidien, cousues ici, livrées partout en Tunisie.',
    ctaLabel: 'Les nouveautés',
    ctaTarget: 'nouveautes',
    ctaHref: '',
    published: true,
    sortOrder: 3,
  },
]
