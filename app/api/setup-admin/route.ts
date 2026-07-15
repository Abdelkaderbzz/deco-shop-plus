import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

// One-time admin setup — call GET /api/setup-admin?email=...&password=... to create the first admin
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const email = searchParams.get('email')
  const password = searchParams.get('password')
  const secret = searchParams.get('secret')

  if (secret !== process.env.BETTER_AUTH_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!email || !password) {
    return NextResponse.json({ error: 'email and password required' }, { status: 400 })
  }

  try {
    await auth.api.signUpEmail({
      body: { email, password, name: 'Admin' },
    })
    return NextResponse.json({ success: true, message: `Admin created: ${email}` })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
