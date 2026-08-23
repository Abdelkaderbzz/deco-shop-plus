export const SITE = {
  name: 'Deco Shop Plus',
  shortName: 'DSP',
  tagline: 'Maison & coussins',
  description:
    'Galettes de chaise, coussins de canapé, de lecture et de tête de lit en velours anti-tache. Atelier Deco Shop Plus à Cité El Waha, Bizerte. Livraison partout en Tunisie.',
  city: 'Bizerte',
  neighborhood: 'Cité El Waha',
  region: 'Bizerte',
  country: 'Tunisie',
  address: 'Cité El Waha, Bizerte, Tunisie',
  phoneDisplay: '56 405 932',
  phone: '56 405 932',
  phoneTel: '+21656405932',
  whatsapp: '21656405932',
  facebookUrl: 'https://www.facebook.com/profile.php?id=61579741029151',
  mapsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=Cite+El+Waha%2C+Bizerte%2C+Tunisie',
  footerAbout:
    'Nous sommes un petit atelier. Nous concevons nos propres produits, les fabriquons avec des matières de haute qualité, et les réalisons avec soin et amour.',
} as const

/** Fabric used on the current catalog (galettes and coussins). */
export const PRODUCT_FABRIC = 'Velours anti-tache'

export const SITE_KEYWORDS = [
  'Deco Shop Plus',
  'décoration Bizerte',
  'galettes de chaise Tunisie',
  'coussins Bizerte',
  'coussin de canapé',
  'coussin de lecture',
  'coussin de tête de lit',
  'velours anti-tache',
  'Cité El Waha',
  'boutique déco Bizerte',
  'livraison Tunisie',
]

/** Shown in FAQ and product structured data. */
export const STORE_RETURN_DAYS = 7

export const STORE_FAQS = [
  {
    question: 'Où se trouve Deco Shop Plus ?',
    answer:
      'Notre atelier est à Cité El Waha, Bizerte. Vous pouvez commander en ligne ou nous écrire sur WhatsApp.',
  },
  {
    question: 'Livrez-vous partout en Tunisie ?',
    answer:
      'Oui. Nous livrons dans tous les gouvernorats. Le paiement se fait à la livraison.',
  },
  {
    question: 'Quelle est la matière des coussins ?',
    answer:
      'Les galettes et coussins du catalogue actuel sont en velours anti-tache, cousus à l’atelier.',
  },
  {
    question: 'Puis-je échanger un article ?',
    answer:
      'Oui, contactez-nous sur WhatsApp dans les 7 jours si l’article n’a pas été utilisé.',
  },
] as const
