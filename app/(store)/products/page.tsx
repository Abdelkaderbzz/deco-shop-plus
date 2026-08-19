import { getCategories } from '@/app/actions/categories'
import { getStoreProductsPaginated } from '@/app/actions/products'
import { mergeStoreCategories } from '@/lib/store-categories'
import { normalizePage, STORE_PAGE_SIZE } from '@/lib/pagination'
import { ProductsClient } from './products-client'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; page?: string }>
}) {
  const params = await searchParams
  const category = params.category ?? 'all'
  const search = params.search?.trim() ?? ''
  const page = normalizePage(params.page)

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

  return (
    <div className="mx-auto max-w-7xl px-2 py-8 sm:px-3">
      <ProductsClient
        products={productPage.items}
        total={productPage.total}
        page={productPage.page}
        totalPages={productPage.totalPages}
        search={search}
        category={category}
        storeCategories={storeCategories}
      />
    </div>
  )
}
