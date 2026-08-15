import { getAdminBoutiques } from '@/app/actions/boutiques'
import { AdminBoutiquesClient } from '../../admin-boutiques-client'
import { AdminPageHeader } from '../../admin-ui'

export default async function AdminBoutiquesPage() {
  const boutiques = await getAdminBoutiques()

  return (
    <div>
      <AdminPageHeader
        eyebrow="POINTS DE VENTE"
        title="Boutiques"
        description="Gerez vos adresses: photo, contact, note et disponibilite comme point de retrait a la commande."
      />
      <AdminBoutiquesClient initialBoutiques={boutiques} />
    </div>
  )
}
