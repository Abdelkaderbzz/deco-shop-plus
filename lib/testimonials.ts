export type TestimonialSource = 'facebook' | 'instagram' | 'whatsapp'

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
  source: TestimonialSource
  username: string
  message: string
  time: string
  avatar: string
  avatarColor?: string
  storyRing?: boolean
}

export type TestimonialItem = TestimonialScreenshot | TestimonialComment

export const TESTIMONIAL_ITEMS: TestimonialItem[] = [
  {
    kind: 'comment',
    id: 'fb-nour',
    source: 'facebook',
    username: 'Nour Mardessi',
    message: 'La meilleure marque où tu peux acheter en toute tranquillité, avec une qualité top 🌸💗🌺👌🏻',
    time: 'il y a 8 mois',
    avatar: 'N',
    avatarColor: '#5c6bc0',
  },
  {
    kind: 'comment',
    id: 'fb-bilel',
    source: 'facebook',
    username: 'Bilel Trabelsi',
    message: 'Top de chez top ❤️❤️',
    time: 'il y a 8 mois',
    avatar: 'B',
    avatarColor: '#26a69a',
  },
  {
    kind: 'comment',
    id: 'fb-aleyaj',
    source: 'facebook',
    username: 'aleyaj',
    message: 'Qualité supérieure, livraison en moins de 24h. Merci pour ce service génial ! Je recommande vivement',
    time: 'il y a 8 mois',
    avatar: 'a',
    avatarColor: '#42a5f5',
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
  facebook: { label: 'Facebook', dotClass: 'bg-[#1877F2]' },
  instagram: { label: 'Instagram', dotClass: 'bg-linear-to-r from-pink-500 to-orange-400' },
  whatsapp: { label: 'WhatsApp', dotClass: 'bg-emerald-500' },
}

const SOURCE_ORDER: TestimonialSource[] = ['facebook', 'instagram', 'whatsapp']

export function usedTestimonialSources(items: TestimonialItem[] = TESTIMONIAL_ITEMS) {
  const present = new Set(items.map((item) => item.source))
  return SOURCE_ORDER.filter((source) => present.has(source))
}

export function facebookTestimonials(items: TestimonialItem[] = TESTIMONIAL_ITEMS) {
  return items.filter((item) => item.source === 'facebook')
}

export function socialTestimonials(items: TestimonialItem[] = TESTIMONIAL_ITEMS) {
  return items.filter((item) => item.source === 'instagram' || item.source === 'whatsapp')
}
