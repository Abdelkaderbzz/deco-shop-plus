import { AdminPageSkeleton } from '../../admin-ui'

export default function AdminHeroLoading() {
  return (
    <AdminPageSkeleton
      eyebrow="PAGE D ACCUEIL"
      title="Carrousel hero"
      description="Creez les slides du bandeau d accueil : image, texte et bouton anime vers une section."
      rows={4}
      columns={2}
    />
  )
}
