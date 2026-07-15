import { getSettings } from '@/app/actions/settings'
import { AdminSettingsClient } from '../../admin-settings-client'
import { AdminPageHeader } from '../../admin-ui'

export default async function AdminSettingsPage() {
  const settings = await getSettings()

  return (
    <div>
      <AdminPageHeader
        eyebrow="CONFIGURATION"
        title="Livraison"
        description="Definissez le tarif de livraison applique automatiquement aux commandes en ligne."
      />
      <AdminSettingsClient initialSettings={settings} />
    </div>
  )
}
