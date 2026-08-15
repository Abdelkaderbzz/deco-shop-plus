export type TestimonialSource = 'google' | 'instagram' | 'whatsapp'

type BaseTestimonial = {
  id: string
  source: TestimonialSource
}

/** A real screenshot, shown as-is. Intrinsic size lets the marquee derive the
 *  card width from a fixed row height, so mixed ratios never get distorted. */
export type TestimonialScreenshot = BaseTestimonial & {
  kind: 'screenshot'
  src: string
  width: number
  height: number
  alt: string
}

/** A comment rendered as a card, styled after the platform it came from. */
export type TestimonialComment = BaseTestimonial & {
  kind: 'comment'
  source: 'instagram' | 'whatsapp'
  username: string
  message: string
  time: string
  avatar: string
  /** Instagram only: draw the gradient story ring around the avatar. */
  storyRing?: boolean
}

export type TestimonialItem = TestimonialScreenshot | TestimonialComment

/** One ordered wall of social proof. Google screenshots live on the top row;
 *  Instagram and WhatsApp comments share the bottom. Add screenshots to
 *  `public/reviews` and append them here — the rows and the source legend
 *  both derive from this list. */
export const TESTIMONIAL_ITEMS: TestimonialItem[] = [
  {
    kind: 'screenshot',
    id: 'google-pulut',
    source: 'google',
    src: '/reviews/pulut-plghuv.webp',
    width: 714,
    height: 278,
    alt: 'Avis Google 5 etoiles de Pulut Plghuv : « Nice service »',
  },
  {
    kind: 'comment',
    id: 'ig-fedi',
    source: 'instagram',
    username: 'fedi.alaya',
    message: 'Produit original w qualité top, merci Water of Gold 🔥',
    time: '7 sem',
    avatar: 'FA',
  },
  {
    kind: 'comment',
    id: 'wa-beyahaw',
    source: 'whatsapp',
    username: 'beyahaw',
    message: 'التوصيل للدار سريع برشا، الريحة روعة ❤️',
    time: '14:32',
    avatar: 'BY',
  },
  {
    kind: 'screenshot',
    id: 'google-mohamed',
    source: 'google',
    src: '/reviews/mohamed-regaya.webp',
    width: 732,
    height: 258,
    alt: 'Avis Google 5 etoiles de Mohamed Regaya : « A wide variety of quality perfumes. I recommend it. »',
  },
  {
    kind: 'comment',
    id: 'ig-ala',
    source: 'instagram',
    username: 'ala_chafroud',
    message: 'Commande recue, tout est parfait ❤️ ❤️',
    time: '7 sem',
    avatar: 'AC',
    storyRing: true,
  },
  {
    kind: 'comment',
    id: 'wa-olfa',
    source: 'whatsapp',
    username: 'Olfa Ali',
    message: 'الريحة تحفة برشا، شكرا Water of Gold 🙏',
    time: '09:15',
    avatar: 'OA',
  },
  {
    kind: 'screenshot',
    id: 'google-faouzia',
    source: 'google',
    src: '/reviews/faouzia-chouki.webp',
    width: 710,
    height: 290,
    alt: 'Avis Google 5 etoiles de Faouzia Chouki : « On trouve toutes sortes de parfums de grandes marques »',
  },
  {
    kind: 'comment',
    id: 'wa-sarra',
    source: 'whatsapp',
    username: 'Sarra M.',
    message: 'وصلتني الطلبية اليوم، العطر أصلي 100% ✨',
    time: '18:47',
    avatar: 'SM',
  },
  {
    kind: 'screenshot',
    id: 'google-luk',
    source: 'google',
    src: '/reviews/luk-becha.webp',
    width: 724,
    height: 260,
    alt: 'Avis Google 5 etoiles de luk becha : « Numer one »',
  },
  {
    kind: 'comment',
    id: 'ig-olfa',
    source: 'instagram',
    username: 'olfa.ali_',
    message: 'Ma commande est arrivee tres vite ❤️ ❤️ ❤️',
    time: '3 j',
    avatar: 'OL',
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
