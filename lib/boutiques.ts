export type Boutique = {
  slug: string
  name: string
  city: string
  region: string
  description: string
  image: string
  imageAlt: string
  address?: string
  phone?: string
  rating: number
  reviewCount?: number
  ratingSource: string
  directionsUrl: string
}

/** Display number -> tel: href (Tunisian mobile, no spaces). */
export function phoneHref(phone: string) {
  return `tel:+216${phone.replace(/\s+/g, '')}`
}

export const BOUTIQUES: Boutique[] = [
  {
    slug: 'sahloul-sousse',
    name: 'Water of Gold Sousse',
    city: 'Sousse',
    region: 'Sahloul',
    description:
      'Notre boutique a Sousse. Toute la collection femme et homme, avec conseil personnalise sur place.',
    image: '/boutiques/storefront.webp',
    imageAlt: 'Facade de la boutique Water of Gold a Sousse, de nuit',
    address: 'Av. Yasser Arafat, Sousse',
    phone: '27 330 407',
    rating: 4.9,
    ratingSource: 'Google Maps',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=35.8377722%2C10.5965168',
  },
  {
    slug: 'moknine-monastir',
    name: 'Water of Gold Moknine',
    city: 'Moknine',
    region: 'Monastir',
    description:
      'Notre adresse a Moknine. La meme selection de fragrances inspirees et de parfums de choix, longue tenue.',
    image: '/boutiques/interior.webp',
    imageAlt: 'Interieur de la boutique Water of Gold, presentoirs de parfums',
    rating: 4.7,
    reviewCount: 72,
    ratingSource: 'Facebook',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Moknine%2C+Monastir%2C+Tunisie',
  },
]
