import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { catalogHref } from '@/lib/catalog-href'
import { SITE } from '@/lib/site'
import { normalizePage } from '@/lib/pagination'
import { CatalogPage } from './catalog-page'

export const revalidate = 120

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
      alternates: { canonical },
      robots: { index: false, follow: true },
    }
  }

  return {
    title: `Boutique déco à ${SITE.city}`,
    description: `Parcourez coussins, accessoires, rangement et literie chez ${SITE.name} à ${SITE.neighborhood}, ${SITE.city}.`,
    alternates: { canonical: '/products' },
    openGraph: {
      title: `Boutique | ${SITE.name}`,
      description: `Coussins, accessoires, rangement et literie à ${SITE.city}.`,
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
      <CatalogPage category={search ? category : 'all'} search={search} page={page} />
    </div>
  )
}
