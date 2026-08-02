import { AdminPageSkeleton } from '../../admin-ui'

export default function AdminProductsLoading() {
  return (
    <AdminPageSkeleton
      eyebrow="CATALOGUE"
      title="Produits"
      description="Gerez votre catalogue de parfums: prix, stock, images et categories."
      rows={10}
      columns={8}
    />
  )
}
