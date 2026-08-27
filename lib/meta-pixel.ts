/** Meta (Facebook) Pixel browser tracking — call from client components only. */

import {
  buildMetaEventParams,
  metaPurchaseEventId,
  type MetaLineItem,
} from '@/lib/meta-pixel-events'

type Fbq = (
  command: 'track',
  event: string,
  params?: Record<string, unknown>,
  options?: { eventID?: string },
) => void

function fbq(): Fbq | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as Window & { fbq?: Fbq }).fbq
}

function track(event: string, params?: Record<string, unknown>, eventId?: string) {
  const pixel = fbq()
  if (!pixel) return
  if (eventId) {
    pixel('track', event, params, { eventID: eventId })
  } else {
    pixel('track', event, params)
  }
}

export type { MetaLineItem } from '@/lib/meta-pixel-events'
export { META_CURRENCY, metaPurchaseEventId } from '@/lib/meta-pixel-events'

export function trackViewContent(item: MetaLineItem & { productName: string }) {
  track(
    'ViewContent',
    buildMetaEventParams([item], item.price * item.quantity, item.productName),
  )
}

export function trackAddToCart(item: MetaLineItem & { productName: string }) {
  track(
    'AddToCart',
    buildMetaEventParams([item], item.price * item.quantity, item.productName),
  )
}

export function trackInitiateCheckout(items: MetaLineItem[], value: number) {
  track('InitiateCheckout', buildMetaEventParams(items, value))
}

export function trackPurchase(orderId: number, items: MetaLineItem[], value: number) {
  track(
    'Purchase',
    buildMetaEventParams(items, value),
    metaPurchaseEventId(orderId),
  )
}
