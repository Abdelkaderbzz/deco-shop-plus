import { AdminPageSkeleton } from '../../admin-ui'

export default function AdminOrdersLoading() {
  return (
    <AdminPageSkeleton
      eyebrow="VENTES"
      title="Commandes"
      description="Consultez, modifiez le statut, editez les informations client ou supprimez des commandes."
      stats={6}
      rows={10}
      columns={10}
    />
  )
}
