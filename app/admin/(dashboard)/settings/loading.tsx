import { AdminPageHeader } from '../../admin-ui'

export default function AdminSettingsLoading() {
  return (
    <div>
      <AdminPageHeader
        eyebrow="CONFIGURATION"
        title="Livraison"
        description="Definissez le tarif de livraison applique automatiquement aux commandes en ligne."
      />
      <div className="max-w-md animate-pulse space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="h-10 w-full rounded bg-slate-100" />
        <div className="h-10 w-36 rounded bg-slate-200" />
      </div>
    </div>
  )
}
