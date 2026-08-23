import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { catalogHref } from '@/lib/catalog-href'
import { PRODUCT_FABRIC, SITE, SITE_KEYWORDS } from '@/lib/site'
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
  const params = await searchParams
  const search = params.search?.trim() ?? ''
  const page = normalizePage(params.page)
  const canonical = catalogHref({ search, page })

  if (search) {
    return {
      title: `Recherche « ${search} »`,
      description: `Résultats pour « ${search} » chez ${SITE.name} à ${SITE.city}.`,
      alternates: pageAlternates(canonical),
      robots: { index: false, follow: true },
    }
  }

  return {
    title: `Boutique déco à ${SITE.city}`,
    description: `Parcourez les galettes de chaise et coussins en ${PRODUCT_FABRIC} chez ${SITE.name} à ${SITE.neighborhood}, ${SITE.city}. Livraison partout en Tunisie, paiement à la livraison.`,
    keywords: ['boutique déco', SITE.city, PRODUCT_FABRIC, ...SITE_KEYWORDS],
    alternates: pageAlternates('/products'),
    robots: page > 1 ? { index: false, follow: true } : undefined,
    openGraph: {
      title: `Boutique | ${SITE.name}`,
      description: `Galettes et coussins en ${PRODUCT_FABRIC} à ${SITE.city}. Livraison en Tunisie.`,
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
