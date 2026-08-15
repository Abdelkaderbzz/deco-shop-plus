import { getAdminSiteBanner } from '@/app/actions/settings'
import { AdminBannerClient } from '../../admin-banner-client'
import { AdminPageHeader } from '../../admin-ui'

export default async function AdminBannerPage() {
  const banner = await getAdminSiteBanner()

  return (
    <div>
      <AdminPageHeader
        eyebrow="COMMUNICATION"
        title="Banniere d'annonce"
        description="Diffusez une offre, une nouveaute ou une reduction en haut de chaque page de la boutique."
      />
      <AdminBannerClient initialBanner={banner} />
    </div>
  )
}
