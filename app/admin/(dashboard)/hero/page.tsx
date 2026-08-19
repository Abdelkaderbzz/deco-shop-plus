import { getAdminHeroSlides } from '@/app/actions/hero'
import { AdminHeroClient } from '../../admin-hero-client'
import { AdminPageHeader } from '../../admin-ui'

export default async function AdminHeroPage() {
  const slides = await getAdminHeroSlides()

  return (
    <div>
      <AdminPageHeader
        eyebrow="PAGE D ACCUEIL"
        title="Carrousel hero"
        description="Creez les slides du bandeau d accueil : image, texte et bouton anime vers une section."
      />
      <AdminHeroClient initialSlides={slides} />
    </div>
  )
}
