import { getCategories } from '@/app/actions/categories'
import { getStoreProductsPaginated } from '@/app/actions/products'
import { JsonLd } from '@/components/json-ld'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { catalogHref } from '@/lib/catalog-href'
import { breadcrumbJsonLd, collectionPageJsonLd } from '@/lib/seo'
import { SITE } from '@/lib/site'
import { mergeStoreCategories } from '@/lib/store-categories'
import { STORE_PAGE_SIZE } from '@/lib/pagination'
import { ProductsClient } from './products-client'

export async function CatalogPage({
  category,
  search,
  page,
}: {
  category: string
  search: string
  page: number
}) {
  const [productPage, categories] = await Promise.all([
    getStoreProductsPaginated({
      page,
      pageSize: STORE_PAGE_SIZE,
      search,
      category,
    }),
    getCategories(),
  ])
  const storeCategories = mergeStoreCategories(categories)
  const selected = storeCategories.find((item) => item.slug === category)
  const name = selected ? `${selected.name} | ${SITE.name}` : `Boutique | ${SITE.name}`
  const description = selected
    ? `${selected.name} chez ${SITE.name} à ${SITE.neighborhood}, ${SITE.city}. ${selected.tagline}.`
    : SITE.description
  const path = catalogHref({ category, search, page: search ? page : 1 })
  const crumbs = selected
    ? [
        { name: 'Accueil', path: '/' },
        { name: 'Boutique', path: '/products' },
        { name: selected.name, path: catalogHref({ category: selected.slug }) },
      ]
    : [
        { name: 'Accueil', path: '/' },
        { name: 'Boutique', path: '/products' },
      ]

  return (
    <>
      <JsonLd
        data={collectionPageJsonLd({
          name,
          description,
          path,
          products: productPage.items.map((product) => ({ id: product.id, name: product.name })),
        })}
      />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs
        items={crumbs.map((item, index) => ({
          name: item.name,
          href: index === crumbs.length - 1 ? undefined : item.path,
        }))}
      />
      <ProductsClient
        products={productPage.items}
        total={productPage.total}
        page={productPage.page}
        totalPages={productPage.totalPages}
        search={search}
        category={category}
        storeCategories={storeCategories}
      />
    </>
  )
}
