import { AdminPageHeader } from '../../admin-ui'

export default function AdminBannerLoading() {
  return (
    <div>
      <AdminPageHeader
        eyebrow="COMMUNICATION"
        title="Bannieres d'annonce"
        description="Creez plusieurs bannieres (offre, nouveaute, reduction), personnalisez couleurs et taille, puis publiez celle de votre choix."
      />
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="h-4 w-32 rounded bg-slate-200" />
              <div className="h-5 w-20 rounded-full bg-slate-100" />
            </div>
            <div className="h-9 w-full rounded bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  )
}
