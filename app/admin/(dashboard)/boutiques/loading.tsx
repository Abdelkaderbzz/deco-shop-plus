import { AdminPageSkeleton } from '../../admin-ui'

export default function AdminBoutiquesLoading() {
  return (
    <AdminPageSkeleton
      eyebrow="POINTS DE VENTE"
      title="Boutiques"
      description="Gerez vos adresses: photo, contact, note et disponibilite comme point de retrait a la commande."
      rows={3}
      columns={7}
    />
  )
}
