/** Meta (Facebook) Pixel browser tracking — call from client components only. */

import {
  buildMetaEventParams,
  metaPurchaseEventId,
  type MetaLineItem,
} from '@/lib/meta-pixel-events'
import { readMetaCookies } from '@/lib/meta-cookies'

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

function testEventCode() {
  return process.env.NEXT_PUBLIC_META_TEST_EVENT_CODE?.trim() || ''
}

/** Mirror to CAPI with test_event_code so Events Manager → Test events lights up. */
function mirrorToTestEvents(
  eventName: string,
  params?: Record<string, unknown>,
  eventId?: string,
) {
  if (!testEventCode()) return
  const cookies = readMetaCookies()
  void fetch('/api/meta-test-event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventName,
      eventId,
      customData: params,
      eventSourceUrl: window.location.href,
      fbp: cookies.fbp,
      fbc: cookies.fbc,
    }),
    keepalive: true,
  }).catch(() => {})
}

function track(event: string, params?: Record<string, unknown>, eventId?: string) {
  const pixel = fbq()
  if (pixel) {
    if (eventId) {
      pixel('track', event, params, { eventID: eventId })
    } else {
      pixel('track', event, params)
    }
  }
  mirrorToTestEvents(event, params, eventId)
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
