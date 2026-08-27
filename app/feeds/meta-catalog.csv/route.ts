import { buildMetaCatalogCsv } from '@/lib/meta-catalog'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const secret = process.env.META_CATALOG_SECRET?.trim()
  if (secret) {
    const key = new URL(request.url).searchParams.get('key')
    if (key !== secret) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
  }

  const csv = await buildMetaCatalogCsv()

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  })
}
