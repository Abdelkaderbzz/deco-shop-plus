import { AdminPageSkeleton } from '../../admin-ui'

export default function AdminCarouselLoading() {
  return (
    <AdminPageSkeleton
      eyebrow="PAGE D ACCUEIL"
      title="Carousel videos"
      description="Ajoutez, modifiez et reorganisez les liens Instagram reel affiches dans le carousel."
      rows={5}
      columns={4}
    />
  )
}
