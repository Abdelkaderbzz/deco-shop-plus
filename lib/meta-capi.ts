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

/** From Events Manager → Test events. Remove after testing. */
export function metaTestEventCode() {
  return (
    process.env.META_TEST_EVENT_CODE?.trim() ||
    process.env.NEXT_PUBLIC_META_TEST_EVENT_CODE?.trim() ||
    ''
  )
}

export async function sendMetaCapiEvent(input: {
  eventName: string
  eventId?: string
  value?: number
  items?: MetaLineItem[]
  customerPhone?: string
  meta?: MetaAttribution
  customData?: Record<string, unknown>
}) {
  const accessToken = capiAccessToken()
  if (!accessToken || !META_PIXEL_ID) return { ok: false as const, reason: 'not_configured' }

  const eventTime = Math.floor(Date.now() / 1000)
  const userData: Record<string, string> = {}

  const phone = normalizeTunisiaPhone(input.customerPhone ?? '')
  if (phone) userData.ph = hashSha256(phone)

  if (input.meta?.fbp) userData.fbp = input.meta.fbp
  if (input.meta?.fbc) userData.fbc = input.meta.fbc

  const eventSourceUrl =
    input.meta?.eventSourceUrl?.trim() || absoluteUrl('/')

  const customData =
    input.customData ??
    (input.items && input.value != null
      ? buildMetaCustomData(input.items, input.value)
      : undefined)

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: input.eventName,
        event_time: eventTime,
        ...(input.eventId ? { event_id: input.eventId } : {}),
        action_source: 'website',
        event_source_url: eventSourceUrl,
        user_data: userData,
        ...(customData ? { custom_data: customData } : {}),
      },
    ],
  }

  const testCode = metaTestEventCode()
  if (testCode) payload.test_event_code = testCode

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
      console.error(`[meta-capi] ${input.eventName} failed:`, response.status, body)
      return { ok: false as const, reason: 'http_error' as const, status: response.status }
    }

    return { ok: true as const }
  } catch (error) {
    console.error(`[meta-capi] ${input.eventName} error:`, error)
    return { ok: false as const, reason: 'network' as const }
  }
}

export async function sendMetaPurchaseEvent(input: {
  orderId: number
  value: number
  items: MetaLineItem[]
  customerPhone?: string
  meta?: MetaAttribution
}) {
  return sendMetaCapiEvent({
    eventName: 'Purchase',
    eventId: metaPurchaseEventId(input.orderId),
    value: input.value,
    items: input.items,
    customerPhone: input.customerPhone,
    meta: {
      ...input.meta,
      eventSourceUrl:
        input.meta?.eventSourceUrl?.trim() || absoluteUrl('/checkout/success'),
    },
  })
}
