import { getAdminProductsPaginated, getProductOptions } from '@/app/actions/products'
import { getCategories } from '@/app/actions/categories'
import { ADMIN_PAGE_SIZE, normalizePage } from '@/lib/pagination'
import { AdminProductsClient } from '../../admin-products-client'
import { AdminPageHeader } from '../../admin-ui'

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const params = await searchParams
  const page = normalizePage(params.page)
  const search = params.search?.trim() ?? ''

  const [productPage, categories, productOptions] = await Promise.all([
    getAdminProductsPaginated({ page, pageSize: ADMIN_PAGE_SIZE, search }),
    getCategories(),
    getProductOptions(),
  ])

  return (
    <div>
      <AdminPageHeader
        eyebrow="CATALOGUE"
        title="Produits"
        description="Gerez votre catalogue: prix, stock, images et categories."
      />
      <AdminProductsClient
        products={productPage.items}
        total={productPage.total}
        page={productPage.page}
        search={search}
        categories={categories}
        productOptions={productOptions}
      />
    </div>
  )
}
