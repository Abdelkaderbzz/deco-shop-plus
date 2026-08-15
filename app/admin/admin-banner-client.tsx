'use client'

import { updateSiteBanner } from '@/app/actions/settings'
import { useToast } from '@/components/toast-provider'
import { getErrorMessage } from '@/lib/get-error-message'
import { siteBannerSchema, type SiteBannerFormValues } from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import {
  AdminButton,
  AdminCard,
  AdminFieldError,
  adminInputWithError,
  adminLabelCls,
} from './admin-ui'
import { AdminSelect } from './admin-select'

const VARIANT_OPTIONS = [
  { value: 'offer', label: 'Offre' },
  { value: 'news', label: 'Nouveaute' },
  { value: 'discount', label: 'Promo / Reduction' },
]

const PREVIEW_STYLES: Record<SiteBannerFormValues['bannerVariant'], string> = {
  offer: 'bg-[#c9a44a] text-[#0b0b0b]',
  discount: 'bg-linear-to-r from-[#b8912f] via-[#e0c078] to-[#b8912f] text-[#0b0b0b]',
  news: 'bg-[#1c1810] text-[#f3e6c4]',
}

export function AdminBannerClient({ initialBanner }: { initialBanner: SiteBannerFormValues }) {
  const toast = useToast()
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SiteBannerFormValues>({
    resolver: zodResolver(siteBannerSchema),
    defaultValues: initialBanner,
  })

  const enabled = watch('bannerEnabled')
  const variant = watch('bannerVariant')
  const message = watch('bannerMessage')
  const linkLabel = watch('bannerLinkLabel')

  function onSubmit(values: SiteBannerFormValues) {
    startTransition(async () => {
      try {
        await updateSiteBanner(values)
        reset(values)
        toast.success(
          values.bannerEnabled ? 'Banniere publiee sur la boutique.' : 'Banniere desactivee.',
        )
      } catch (error) {
        toast.error(getErrorMessage(error, 'Impossible de mettre a jour la banniere.'))
      }
    })
  }

  return (
    <div className="max-w-2xl space-y-6">
      <AdminCard title="Banniere d'annonce">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              type="checkbox"
              className="mt-0.5 accent-amber-700"
              {...register('bannerEnabled')}
            />
            <span>
              <span className="block text-sm font-semibold text-slate-900">
                Afficher la banniere en haut de la boutique
              </span>
              <span className="mt-0.5 block text-sm text-slate-500">
                Les visiteurs peuvent la fermer. Elle reapparait si vous modifiez le message.
              </span>
            </span>
          </label>

          <div>
            <label className={adminLabelCls}>Message</label>
            <input
              type="text"
              placeholder="Livraison gratuite des 150 TND"
              className={adminInputWithError(!!errors.bannerMessage)}
              {...register('bannerMessage')}
            />
            <AdminFieldError message={errors.bannerMessage?.message} />
            <p className="mt-1.5 text-xs text-slate-500">{message.length}/160 caracteres</p>
          </div>

          <div>
            <label className={adminLabelCls}>Type</label>
            <AdminSelect
              value={variant}
              onValueChange={(value) =>
                setValue('bannerVariant', value as SiteBannerFormValues['bannerVariant'], {
                  shouldDirty: true,
                })
              }
              items={VARIANT_OPTIONS}
            />
            <p className="mt-1.5 text-xs text-slate-500">
              Offre et Promo affichent un bandeau dore, Nouveaute un bandeau sombre discret.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={adminLabelCls}>Libelle du bouton (optionnel)</label>
              <input
                type="text"
                placeholder="Decouvrir"
                className={adminInputWithError(!!errors.bannerLinkLabel)}
                {...register('bannerLinkLabel')}
              />
              <AdminFieldError message={errors.bannerLinkLabel?.message} />
            </div>
            <div>
              <label className={adminLabelCls}>Lien du bouton</label>
              <input
                type="text"
                placeholder="/products?category=femme"
                className={adminInputWithError(!!errors.bannerLinkHref)}
                {...register('bannerLinkHref')}
              />
              <AdminFieldError message={errors.bannerLinkHref?.message} />
            </div>
          </div>

          <AdminButton type="submit" disabled={isPending}>
            {isPending ? 'Enregistrement...' : 'Enregistrer'}
          </AdminButton>
        </form>
      </AdminCard>

      <AdminCard title="Apercu">
        {enabled && message.trim() !== '' ? (
          <div className={`flex items-center gap-3 rounded-md px-4 py-2 ${PREVIEW_STYLES[variant]}`}>
            <span className="rounded-full bg-black/10 px-2 py-0.5 text-[9px] font-medium tracking-[0.2em]">
              {VARIANT_OPTIONS.find((option) => option.value === variant)?.label.toUpperCase()}
            </span>
            <span className="min-w-0 flex-1 truncate text-center text-xs font-light tracking-wider">
              {message}
            </span>
            {linkLabel.trim() !== '' && (
              <span className="rounded-full border border-current/40 px-3 py-1 text-[10px] tracking-[0.15em]">
                {linkLabel.toUpperCase()}
              </span>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            {enabled
              ? 'Ajoutez un message pour voir l apercu.'
              : 'La banniere est desactivee, rien ne s affiche sur la boutique.'}
          </p>
        )}
      </AdminCard>
    </div>
  )
}
