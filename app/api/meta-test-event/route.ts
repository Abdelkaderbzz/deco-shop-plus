import { sendMetaCapiEvent } from '@/lib/meta-capi'
import { NextResponse } from 'next/server'

const ALLOWED_EVENTS = new Set([
  'PageView',
  'ViewContent',
  'AddToCart',
  'InitiateCheckout',
  'Purchase',
  'Contact',
  'Search',
])

/**
 * Mirrors browser events to Conversions API with test_event_code
 * so they appear in Meta Events Manager → Test events.
 * Only active when META_TEST_EVENT_CODE / NEXT_PUBLIC_META_TEST_EVENT_CODE is set.
 */
export async function POST(request: Request) {
  const testCode =
    process.env.META_TEST_EVENT_CODE?.trim() ||
    process.env.NEXT_PUBLIC_META_TEST_EVENT_CODE?.trim()
  if (!testCode) {
    return NextResponse.json({ ok: false, reason: 'test_mode_off' }, { status: 404 })
  }

  let body: {
    eventName?: string
    eventId?: string
    customData?: Record<string, unknown>
    eventSourceUrl?: string
    fbp?: string
    fbc?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const eventName = body.eventName?.trim()
  if (!eventName || !ALLOWED_EVENTS.has(eventName)) {
    return NextResponse.json({ ok: false, reason: 'invalid_event' }, { status: 400 })
  }

  const result = await sendMetaCapiEvent({
    eventName,
    eventId: body.eventId,
    customData: body.customData,
    meta: {
      fbp: body.fbp,
      fbc: body.fbc,
      eventSourceUrl: body.eventSourceUrl,
    },
  })

  return NextResponse.json(result, { status: result.ok ? 200 : 502 })
}
