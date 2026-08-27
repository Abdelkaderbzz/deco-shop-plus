import { metaCatalogFeedResponse } from '@/lib/meta-catalog-feed'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  return metaCatalogFeedResponse(request)
}
