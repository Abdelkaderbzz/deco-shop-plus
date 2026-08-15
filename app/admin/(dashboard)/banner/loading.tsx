import { AdminPageHeader } from '../../admin-ui'

export default function AdminBannerLoading() {
  return (
    <div>
      <AdminPageHeader
        eyebrow="COMMUNICATION"
        title="Banniere d'annonce"
        description="Diffusez une offre, une nouveaute ou une reduction en haut de chaque page de la boutique."
      />
      <div className="max-w-2xl animate-pulse space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-14 w-full rounded bg-slate-100" />
        <div className="h-4 w-24 rounded bg-slate-200" />
        <div className="h-10 w-full rounded bg-slate-100" />
        <div className="h-4 w-16 rounded bg-slate-200" />
        <div className="h-10 w-full rounded bg-slate-100" />
        <div className="h-10 w-36 rounded bg-slate-200" />
      </div>
    </div>
  )
}
