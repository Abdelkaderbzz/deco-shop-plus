import { saveAbandonedCheckout } from '@/app/actions/orders'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  let payload: unknown
  try {
    const text = await request.text()
    payload = text ? JSON.parse(text) : null
  } catch {
    return NextResponse.json({ success: false }, { status: 400 })
  }

  const result = await saveAbandonedCheckout(payload)
  return NextResponse.json(result, { status: result.success ? 200 : 400 })
}
