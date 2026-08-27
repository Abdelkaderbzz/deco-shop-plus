import { createHash } from 'node:crypto'
import {
  buildMetaCustomData,
  metaPurchaseEventId,
  type MetaLineItem,
} from '@/lib/meta-pixel-events'
import { META_PIXEL_ID } from '@/lib/site'
import { absoluteUrl } from '@/lib/site-url'

export type MetaAttribution = {
  fbp?: string
  fbc?: string
  eventSourceUrl?: string
}

function hashSha256(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

function normalizeTunisiaPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('216')) return digits
  if (digits.startsWith('0')) return `216${digits.slice(1)}`
  return `216${digits}`
}

function capiAccessToken() {
  return process.env.META_CAPI_ACCESS_TOKEN?.trim() || ''
}

export async function sendMetaPurchaseEvent(input: {
  orderId: number
  value: number
  items: MetaLineItem[]
  customerPhone?: string
  meta?: MetaAttribution
}) {
  const accessToken = capiAccessToken()
  if (!accessToken || !META_PIXEL_ID) return

  const eventId = metaPurchaseEventId(input.orderId)
  const eventTime = Math.floor(Date.now() / 1000)
  const userData: Record<string, string> = {}

  const phone = normalizeTunisiaPhone(input.customerPhone ?? '')
  if (phone) userData.ph = hashSha256(phone)

  if (input.meta?.fbp) userData.fbp = input.meta.fbp
  if (input.meta?.fbc) userData.fbc = input.meta.fbc

  const eventSourceUrl =
    input.meta?.eventSourceUrl?.trim() || absoluteUrl('/checkout/success')

  const payload = {
    data: [
      {
        event_name: 'Purchase',
        event_time: eventTime,
        event_id: eventId,
        action_source: 'website',
        event_source_url: eventSourceUrl,
        user_data: userData,
        custom_data: buildMetaCustomData(input.items, input.value),
      },
    ],
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    )

    if (!response.ok) {
      const body = await response.text()
      console.error('[meta-capi] Purchase failed:', response.status, body)
    }
  } catch (error) {
    console.error('[meta-capi] Purchase error:', error)
  }
}
