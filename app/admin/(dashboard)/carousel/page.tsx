import { getCarouselVideos } from '@/app/actions/carousel'
import { AdminCarouselClient } from '../../admin-carousel-client'
import { AdminPageHeader } from '../../admin-ui'

export const dynamic = 'force-dynamic'

export default async function AdminCarouselPage() {
  const videos = await getCarouselVideos()

  return (
    <div>
      <AdminPageHeader
        eyebrow="PAGE D ACCUEIL"
        title="Carousel videos"
        description="Ajoutez, modifiez et reorganisez les liens Instagram reel affiches dans le carousel."
      />
      <AdminCarouselClient initialVideos={videos} />
    </div>
  )
}
