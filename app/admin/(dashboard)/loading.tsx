import { AdminPageSkeleton } from '../admin-ui'

export default function AdminDashboardLoading() {
  return (
    <AdminPageSkeleton
      eyebrow="ADMINISTRATION"
      title="Tableau de bord"
      description="Vue d'ensemble de votre boutique: produits, commandes, categories et tarifs de livraison."
      stats={4}
      rows={5}
      columns={5}
    />
  )
}
