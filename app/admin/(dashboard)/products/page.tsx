import { getProducts } from '@/app/actions/products'
import { getCategories } from '@/app/actions/categories'
import { AdminProductsClient } from '../../admin-products-client'
import { AdminPageHeader } from '../../admin-ui'

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()])

  return (
    <div>
      <AdminPageHeader
        eyebrow="CATALOGUE"
        title="Produits"
        description="Gerez votre catalogue de parfums: prix, stock, images et categories."
      />
      <AdminProductsClient initialProducts={products} categories={categories} />
    </div>
  )
}
