import { SITE } from '@/lib/site'

export const WHATSAPP_PHONE = SITE.whatsapp
export const WHATSAPP_URL = `https://wa.me/${SITE.whatsapp}`

export function whatsappMessageUrl(text: string) {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`
}
export const PHONE_HREF = `tel:${SITE.phoneTel}`
export const FACEBOOK_URL = SITE.facebookUrl
export const MAPS_URL = SITE.mapsUrl
