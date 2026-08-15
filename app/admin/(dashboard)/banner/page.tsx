import { getAdminBanners } from '@/app/actions/banners'
import { AdminBannerClient } from '../../admin-banner-client'
import { AdminPageHeader } from '../../admin-ui'

export default async function AdminBannerPage() {
  const banners = await getAdminBanners()

  return (
    <div>
      <AdminPageHeader
        eyebrow="COMMUNICATION"
        title="Bannieres d'annonce"
        description="Creez plusieurs bannieres (offre, nouveaute, reduction), personnalisez couleurs et taille, puis publiez celle de votre choix."
      />
      <AdminBannerClient initialBanners={banners} />
    </div>
  )
}
