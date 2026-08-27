import { buildMetaCatalogCsv } from '@/lib/meta-catalog'
import { NextResponse } from 'next/server'

export async function metaCatalogFeedResponse(request: Request) {
  const secret = process.env.META_CATALOG_SECRET?.trim()
  if (secret) {
    const key = new URL(request.url).searchParams.get('key')
    if (key !== secret) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
  }

  try {
    const csv = await buildMetaCatalogCsv()

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'inline; filename="meta-catalog.csv"',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('[meta-catalog] feed error:', error)
    return new NextResponse('Catalog feed unavailable', { status: 500 })
  }
}
