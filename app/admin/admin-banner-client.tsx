'use client'

import {
  addBanner,
  deleteBanner,
  duplicateBanner,
  setActiveBanner,
  updateBanner,
  type BannerRow,
} from '@/app/actions/banners'
import { useConfirm } from '@/components/confirm-provider'
import { useToast } from '@/components/toast-provider'
import { getErrorMessage } from '@/lib/get-error-message'
import {
  BANNER_FONT_SIZE_MAX,
  BANNER_FONT_SIZE_MIN,
  bannerSchema,
  type BannerFormValues,
  type BannerVariant,
} from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { Copy, Pencil, Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import {
  AdminBadge,
  AdminButton,
  AdminEmptyState,
  AdminFieldError,
  AdminIconButton,
  AdminModal,
  adminInputWithError,
  adminLabelCls,
} from './admin-ui'

const VARIANT_LABELS: Record<BannerVariant, string> = {
  offer: 'OFFRE',
  news: 'NOUVEAUTE',
  discount: 'PROMO',
}

/** One-click starting points; every colour stays editable afterwards. */
const PRESETS: { variant: BannerVariant; label: string; backgroundColor: string; textColor: string }[] =
  [
    { variant: 'offer', label: 'Offre doree', backgroundColor: '#c9a44a', textColor: '#0b0b0b' },
    { variant: 'discount', label: 'Promo sombre', backgroundColor: '#7a1f1f', textColor: '#f8e9c8' },
    { variant: 'news', label: 'Nouveaute discrete', backgroundColor: '#1c1810', textColor: '#f3e6c4' },
  ]

const EMPTY_FORM: BannerFormValues = {
  name: '',
  message: '',
  variant: 'offer',
  backgroundColor: '#c9a44a',
  textColor: '#0b0b0b',
  fontSize: 13,
  linkLabel: '',
  linkHref: '',
  dismissible: true,
  active: true,
}

function BannerPreview({ values }: { values: BannerFormValues }) {
  return (
    <div
      className="flex items-center gap-3 rounded-md px-4 py-2"
      style={{
        backgroundColor: values.backgroundColor,
        color: values.textColor,
        fontSize: `${values.fontSize}px`,
      }}
    >
      <span className="shrink-0 rounded-full bg-current/15 px-2 py-0.5 text-[0.7em] font-medium tracking-[0.2em]">
        {VARIANT_LABELS[values.variant]}
      </span>
      <span className="min-w-0 flex-1 truncate text-center font-light tracking-wider">
        {values.message.trim() || 'Votre message apparait ici'}
      </span>
      {values.linkLabel.trim() !== '' && (
        <span className="shrink-0 rounded-full border border-current/40 px-3 py-1 text-[0.8em] tracking-[0.15em]">
          {values.linkLabel.toUpperCase()}
        </span>
      )}
    </div>
  )
}

const colorInputCls = 'size-10 shrink-0 cursor-pointer rounded-md border border-slate-300 bg-white p-1'

export function AdminBannerClient({ initialBanners }: { initialBanners: BannerRow[] }) {
  const toast = useToast()
  const { confirm } = useConfirm()
  const [banners, setBanners] = useState(initialBanners)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<BannerRow | null>(null)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: EMPTY_FORM,
  })

  const values = watch()

  function openAdd() {
    setEditing(null)
    reset({ ...EMPTY_FORM, active: banners.length === 0 })
    setShowForm(true)
  }

  function openEdit(banner: BannerRow) {
    setEditing(banner)
    reset({
      name: banner.name,
      message: banner.message,
      variant: banner.variant as BannerVariant,
      backgroundColor: banner.backgroundColor,
      textColor: banner.textColor,
      fontSize: banner.fontSize,
      linkLabel: banner.linkLabel,
      linkHref: banner.linkHref,
      dismissible: banner.dismissible,
      active: banner.active,
    })
    setShowForm(true)
  }

  function applyPreset(preset: (typeof PRESETS)[number]) {
    setValue('variant', preset.variant, { shouldDirty: true })
    setValue('backgroundColor', preset.backgroundColor, { shouldDirty: true })
    setValue('textColor', preset.textColor, { shouldDirty: true })
  }

  function onSubmit(formValues: BannerFormValues) {
    startTransition(async () => {
      try {
        const result = editing
          ? await updateBanner(editing.id, formValues)
          : await addBanner(formValues)

        if (!result.success) {
          toast.error(result.error)
          return
        }

        // Publishing one banner retires the others, so mirror that locally.
        setBanners((prev) => {
          const next = editing
            ? prev.map((banner) => (banner.id === editing.id ? result.data : banner))
            : [result.data, ...prev]
          return formValues.active
            ? next.map((banner) =>
                banner.id === result.data.id ? banner : { ...banner, active: false },
              )
            : next
        })

        toast.success(
          formValues.active
            ? 'Banniere enregistree et publiee sur la boutique.'
            : 'Banniere enregistree comme brouillon.',
        )
        setShowForm(false)
      } catch (error) {
        toast.error(getErrorMessage(error, "Impossible d'enregistrer la banniere."))
      }
    })
  }

  function handleToggleActive(banner: BannerRow) {
    startTransition(async () => {
      const result = await setActiveBanner(banner.id, !banner.active)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setBanners(result.data)
      toast.success(banner.active ? 'Banniere retiree de la boutique.' : 'Banniere publiee.')
    })
  }

  function handleDuplicate(banner: BannerRow) {
    startTransition(async () => {
      const result = await duplicateBanner(banner.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setBanners((prev) => [...prev, result.data])
      toast.success('Copie creee. Modifiez-la puis publiez-la.')
    })
  }

  async function handleDelete(banner: BannerRow) {
    const ok = await confirm({
      title: 'Supprimer cette banniere ?',
      description: banner.active
        ? 'Elle est actuellement affichee sur la boutique. Aucune banniere ne sera visible ensuite.'
        : 'Cette banniere enregistree sera definitivement supprimee.',
      confirmLabel: 'Supprimer',
      variant: 'destructive',
    })
    if (!ok) return

    startTransition(async () => {
      const result = await deleteBanner(banner.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setBanners((prev) => prev.filter((item) => item.id !== banner.id))
      toast.success('Banniere supprimee.')
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <AdminButton variant="outline" onClick={openAdd} disabled={isPending}>
          + Nouvelle banniere
        </AdminButton>
      </div>

      {banners.length === 0 ? (
        <AdminEmptyState message="Aucune banniere enregistree. Creez-en une pour annoncer une offre ou une nouveaute." />
      ) : (
        <ul className="space-y-4">
          {banners.map((banner) => (
            <li
              key={banner.id}
              className={`rounded-lg border bg-white p-5 shadow-sm ${
                banner.active ? 'border-amber-400 ring-1 ring-amber-200' : 'border-slate-200'
              }`}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {banner.name || 'Banniere sans nom'}
                  </p>
                  <AdminBadge tone={banner.active ? 'success' : 'default'}>
                    {banner.active ? 'En ligne' : 'Brouillon'}
                  </AdminBadge>
                  {!banner.dismissible && <AdminBadge tone="info">Non fermable</AdminBadge>}
                </div>

                <div className="flex items-center gap-1">
                  <AdminButton
                    variant={banner.active ? 'ghost' : 'outline'}
                    onClick={() => handleToggleActive(banner)}
                    disabled={isPending}
                  >
                    {banner.active ? 'Retirer' : 'Publier'}
                  </AdminButton>
                  <AdminIconButton
                    label="Modifier la banniere"
                    onClick={() => openEdit(banner)}
                    disabled={isPending}
                  >
                    <Pencil className="size-4" />
                  </AdminIconButton>
                  <AdminIconButton
                    label="Dupliquer la banniere"
                    onClick={() => handleDuplicate(banner)}
                    disabled={isPending}
                  >
                    <Copy className="size-4" />
                  </AdminIconButton>
                  <AdminIconButton
                    label="Supprimer la banniere"
                    variant="danger"
                    onClick={() => handleDelete(banner)}
                    disabled={isPending}
                  >
                    <Trash2 className="size-4" />
                  </AdminIconButton>
                </div>
              </div>

              <BannerPreview
                values={{
                  name: banner.name,
                  message: banner.message,
                  variant: banner.variant as BannerVariant,
                  backgroundColor: banner.backgroundColor,
                  textColor: banner.textColor,
                  fontSize: banner.fontSize,
                  linkLabel: banner.linkLabel,
                  linkHref: banner.linkHref,
                  dismissible: banner.dismissible,
                  active: banner.active,
                }}
              />

              {banner.linkHref && (
                <p className="mt-2 text-xs text-slate-500">
                  Bouton vers <span className="font-medium text-slate-700">{banner.linkHref}</span>
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {showForm && (
        <AdminModal
          title={editing ? 'Modifier la banniere' : 'Nouvelle banniere'}
          onClose={() => !isPending && setShowForm(false)}
          className="max-w-2xl"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className={adminLabelCls}>APERCU</p>
              <BannerPreview values={values} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={adminLabelCls}>NOM INTERNE</label>
                <input
                  className={adminInputWithError(!!errors.name)}
                  placeholder="Ex: Soldes ete"
                  disabled={isPending}
                  {...register('name')}
                />
                <AdminFieldError message={errors.name?.message} />
                <p className="mt-1 text-xs text-slate-500">Sert uniquement a la retrouver ici.</p>
              </div>
              <div>
                <label className={adminLabelCls}>TYPE</label>
                <select
                  className={adminInputWithError(!!errors.variant)}
                  disabled={isPending}
                  {...register('variant')}
                >
                  <option value="offer">Offre</option>
                  <option value="news">Nouveaute</option>
                  <option value="discount">Promo / Reduction</option>
                </select>
                <AdminFieldError message={errors.variant?.message} />
                <p className="mt-1 text-xs text-slate-500">Affiche l etiquette a gauche du texte.</p>
              </div>
            </div>

            <div>
              <label className={adminLabelCls}>MESSAGE *</label>
              <input
                className={adminInputWithError(!!errors.message)}
                placeholder="Livraison gratuite des 150 TND"
                disabled={isPending}
                {...register('message')}
              />
              <AdminFieldError message={errors.message?.message} />
              <p className="mt-1 text-xs text-slate-500">{values.message.length}/160 caracteres</p>
            </div>

            <div>
              <p className={adminLabelCls}>STYLES RAPIDES</p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    disabled={isPending}
                    className="flex items-center gap-2 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-amber-500 hover:bg-amber-50"
                  >
                    <span
                      className="size-3.5 rounded-full border border-black/10"
                      style={{ backgroundColor: preset.backgroundColor }}
                    />
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={adminLabelCls}>COULEUR DE FOND</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className={colorInputCls}
                    disabled={isPending}
                    value={values.backgroundColor}
                    onChange={(event) =>
                      setValue('backgroundColor', event.target.value, { shouldDirty: true })
                    }
                  />
                  <input
                    className={adminInputWithError(!!errors.backgroundColor)}
                    disabled={isPending}
                    {...register('backgroundColor')}
                  />
                </div>
                <AdminFieldError message={errors.backgroundColor?.message} />
              </div>
              <div>
                <label className={adminLabelCls}>COULEUR DU TEXTE</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className={colorInputCls}
                    disabled={isPending}
                    value={values.textColor}
                    onChange={(event) =>
                      setValue('textColor', event.target.value, { shouldDirty: true })
                    }
                  />
                  <input
                    className={adminInputWithError(!!errors.textColor)}
                    disabled={isPending}
                    {...register('textColor')}
                  />
                </div>
                <AdminFieldError message={errors.textColor?.message} />
              </div>
            </div>

            <div>
              <label className={adminLabelCls}>TAILLE DU TEXTE — {values.fontSize}px</label>
              <input
                type="range"
                min={BANNER_FONT_SIZE_MIN}
                max={BANNER_FONT_SIZE_MAX}
                step={1}
                className="w-full accent-amber-700"
                disabled={isPending}
                {...register('fontSize', { valueAsNumber: true })}
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>{BANNER_FONT_SIZE_MIN}px</span>
                <span>{BANNER_FONT_SIZE_MAX}px</span>
              </div>
              <AdminFieldError message={errors.fontSize?.message} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={adminLabelCls}>LIBELLE DU BOUTON (OPTIONNEL)</label>
                <input
                  className={adminInputWithError(!!errors.linkLabel)}
                  placeholder="Decouvrir"
                  disabled={isPending}
                  {...register('linkLabel')}
                />
                <AdminFieldError message={errors.linkLabel?.message} />
              </div>
              <div>
                <label className={adminLabelCls}>LIEN DU BOUTON</label>
                <input
                  className={adminInputWithError(!!errors.linkHref)}
                  placeholder="/products?category=femme"
                  disabled={isPending}
                  {...register('linkHref')}
                />
                <AdminFieldError message={errors.linkHref?.message} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                <input
                  type="checkbox"
                  className="mt-0.5 accent-amber-700"
                  disabled={isPending}
                  {...register('active')}
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-900">
                    Publier maintenant
                  </span>
                  <span className="mt-0.5 block text-sm text-slate-500">
                    Une seule banniere s affiche: celle-ci remplacera la banniere en ligne.
                  </span>
                </span>
              </label>
              <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                <input
                  type="checkbox"
                  className="mt-0.5 accent-amber-700"
                  disabled={isPending}
                  {...register('dismissible')}
                />
                <span>
                  <span className="block text-sm font-semibold text-slate-900">
                    Fermable par le visiteur
                  </span>
                  <span className="mt-0.5 block text-sm text-slate-500">
                    Elle reapparait si vous modifiez le message.
                  </span>
                </span>
              </label>
            </div>

            <AdminButton type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Enregistrement...' : editing ? 'Enregistrer' : 'Creer la banniere'}
            </AdminButton>
          </form>
        </AdminModal>
      )}
    </div>
  )
}
