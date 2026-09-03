import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { catalogHref } from '@/lib/catalog-href'
import { getStorefrontI18n } from '@/lib/i18n/get-locale'
import { SITE, SITE_KEYWORDS } from '@/lib/site'
import { pageAlternates } from '@/lib/seo'
import { normalizePage } from '@/lib/pagination'
import { CatalogSkeleton } from '@/components/store-skeletons'
import { CatalogPage } from './catalog-page'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; page?: string }>
}): Promise<Metadata> {
  const { dict } = await getStorefrontI18n()
  const params = await searchParams
  const search = params.search?.trim() ?? ''
  const page = normalizePage(params.page)
  const canonical = catalogHref({ search, page })

  if (search) {
    return {
      title: dict.catalog.searchTitle(search),
      description: dict.catalog.searchDescription(search, SITE.name, dict.site.city),
      alternates: pageAlternates(canonical),
      robots: { index: false, follow: true },
    }
  }

  return {
    title: dict.catalog.shopTitle(dict.site.city),
    description: dict.catalog.shopDescription(
      dict.site.fabric,
      SITE.name,
      dict.site.neighborhood,
      dict.site.city,
    ),
    keywords: [dict.catalog.title, dict.site.city, dict.site.fabric, ...dict.site.keywords, ...SITE_KEYWORDS],
    alternates: pageAlternates('/products'),
    robots: page > 1 ? { index: false, follow: true } : undefined,
    openGraph: {
      title: `${dict.catalog.title} | ${SITE.name}`,
      description: dict.catalog.shopDescription(
        dict.site.fabric,
        SITE.name,
        dict.site.neighborhood,
        dict.site.city,
      ),
      url: '/products',
    },
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; page?: string }>
}) {
  const params = await searchParams
  const category = params.category ?? 'all'
  const search = params.search?.trim() ?? ''
  const page = normalizePage(params.page)

  if (category !== 'all' && !search) {
    redirect(catalogHref({ category, page }))
  }

  return (
    <div className="mx-auto max-w-7xl px-2 py-8 sm:px-3">
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogPage category={search ? category : 'all'} search={search} page={page} />
      </Suspense>
    </div>
  )
}
