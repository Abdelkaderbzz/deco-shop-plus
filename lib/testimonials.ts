export type TestimonialSource = 'google' | 'instagram' | 'whatsapp'

type BaseTestimonial = {
  id: string
  source: TestimonialSource
}

export type TestimonialScreenshot = BaseTestimonial & {
  kind: 'screenshot'
  src: string
  width: number
  height: number
  alt: string
}

export type TestimonialComment = BaseTestimonial & {
  kind: 'comment'
  source: 'instagram' | 'whatsapp' | 'google'
  username: string
  message: string
  time: string
  avatar: string
  avatarColor?: string
  storyRing?: boolean
  rating?: number
}

export type TestimonialItem = TestimonialScreenshot | TestimonialComment

export const TESTIMONIAL_ITEMS: TestimonialItem[] = [
  {
    kind: 'comment',
    id: 'g-islem',
    source: 'google',
    username: 'islem Abdelhamid',
    message:
      'Je recommande vivement 😍🤩🥰🥰 min ahssen li marque et c’est une fierté li andena une marque tunisienne hakaaaa 🇹🇳 bi qualité w détails hathou Ena jhezi koul min andikoum',
    time: 'il y a 8 mois',
    avatar: 'i',
    avatarColor: '#7e57c2',
    rating: 5,
  },
  {
    kind: 'comment',
    id: 'g-nour',
    source: 'google',
    username: 'Nour Mardessi',
    message: 'La meilleure marque où tu peux acheter en toute tranquillité, avec une qualité top 🌸💗🌺👌🏻',
    time: 'il y a 8 mois',
    avatar: 'N',
    avatarColor: '#5c6bc0',
    rating: 5,
  },
  {
    kind: 'comment',
    id: 'g-bilel',
    source: 'google',
    username: 'Bilel Trabelsi',
    message: 'Top de chez top ❤️❤️',
    time: 'il y a 8 mois',
    avatar: 'B',
    avatarColor: '#26a69a',
    rating: 5,
  },
  {
    kind: 'comment',
    id: 'g-aleyaj',
    source: 'google',
    username: 'aleyaj',
    message: 'Qualité supérieure, livraison en moins de 24h. Merci pour ce service génial ! Je recommande vivement',
    time: 'il y a 8 mois',
    avatar: 'a',
    avatarColor: '#42a5f5',
    rating: 5,
  },
  {
    kind: 'comment',
    id: 'wa-amira',
    source: 'whatsapp',
    username: 'Amira B.',
    message: 'Les coussins wsolou nadhif, couleur kima sur les photos ❤️',
    time: '14:32',
    avatar: 'AB',
  },
  {
    kind: 'comment',
    id: 'ig-sarra',
    source: 'instagram',
    username: 'sarra.home',
    message: 'Rangement des vetements top, salon wella organized',
    time: '3 j',
    avatar: 'SH',
    storyRing: true,
  },
  {
    kind: 'comment',
    id: 'wa-olfa',
    source: 'whatsapp',
    username: 'Olfa Ali',
    message: 'Literie trop douce, livraison rapide a Bizerte 🙏',
    time: '09:15',
    avatar: 'OA',
  },
  {
    kind: 'comment',
    id: 'ig-noura',
    source: 'instagram',
    username: 'noura.cite',
    message: 'Boutique Cite El Waha, accueil super et choix large',
    time: '1 sem',
    avatar: 'NC',
  },
  {
    kind: 'comment',
    id: 'wa-mouna',
    source: 'whatsapp',
    username: 'Mouna K.',
    message: 'Commande les coussins, qualite top et prix raisonnable',
    time: '18:47',
    avatar: 'MK',
  },
  {
    kind: 'comment',
    id: 'ig-rim',
    source: 'instagram',
    username: 'rim.deco',
    message: 'Les accessoires deco ont change le salon ✨',
    time: '5 j',
    avatar: 'RD',
    storyRing: true,
  },
]

export const TESTIMONIAL_SOURCES: Record<TestimonialSource, { label: string; dotClass: string }> = {
  google: { label: 'Avis Google', dotClass: 'bg-[#4285f4]' },
  instagram: { label: 'Instagram', dotClass: 'bg-linear-to-r from-pink-500 to-orange-400' },
  whatsapp: { label: 'WhatsApp', dotClass: 'bg-emerald-500' },
}

const SOURCE_ORDER: TestimonialSource[] = ['google', 'instagram', 'whatsapp']

export function usedTestimonialSources(items: TestimonialItem[] = TESTIMONIAL_ITEMS) {
  const present = new Set(items.map((item) => item.source))
  return SOURCE_ORDER.filter((source) => present.has(source))
}

export function googleTestimonials(items: TestimonialItem[] = TESTIMONIAL_ITEMS) {
  return items.filter((item) => item.source === 'google')
}

export function socialTestimonials(items: TestimonialItem[] = TESTIMONIAL_ITEMS) {
  return items.filter((item) => item.source === 'instagram' || item.source === 'whatsapp')
}
