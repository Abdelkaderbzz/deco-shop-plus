/** A boutique as the storefront consumes it, mapped from the database row. */
export type Boutique = {
  id: number
  slug: string
  name: string
  city: string
  region: string
  description: string
  image: string | null
  imageAlt: string
  address: string | null
  phone: string | null
  rating: number | null
  reviewCount: number | null
  ratingSource: string
  directionsUrl: string
  pickupEnabled: boolean
}

/** A pickup point offered at checkout. */
export type PickupBoutique = {
  id: number
  name: string
  city: string
  region: string
  address: string | null
  phone: string | null
}

/** Display number -> tel: href (Tunisian mobile, no spaces). */
export function phoneHref(phone: string) {
  return `tel:+216${phone.replace(/\s+/g, '')}`
}

export function boutiqueLabel(boutique: Pick<PickupBoutique, 'city' | 'region'>) {
  return boutique.region && boutique.region !== boutique.city
    ? `${boutique.city} — ${boutique.region}`
    : boutique.city
}

export function slugifyBoutique(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}
