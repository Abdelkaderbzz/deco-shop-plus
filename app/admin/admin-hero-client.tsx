'use client'

import {
  createHeroSlide,
  deleteHeroSlide,
  moveHeroSlide,
  updateHeroSlide,
} from '@/app/actions/hero'
import { uploadProductImage } from '@/app/actions/upload'
import { useToast } from '@/components/toast-provider'
import { useConfirm } from '@/components/confirm-provider'
import { HERO_CTA_TARGETS, resolveHeroCtaHref, type HeroSlide } from '@/lib/hero-slides'
import { heroSlideSchema, type HeroSlideFormValues } from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { AdminSelect } from './admin-select'
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

const EMPTY_SLIDE: HeroSlideFormValues = {
  imageUrl: '',
  alt: '',
  eyebrow: 'Cite El Waha · Bizerte',
  title: 'Deco Shop Plus',
  subtitle: 'Coussins et rangement pour la maison.',
  ctaLabel: 'Voir les promotions',
  ctaTarget: 'promotions',
  ctaHref: '',
  published: true,
}

export function AdminHeroClient({ initialSlides }: { initialSlides: HeroSlide[] }) {
  const toast = useToast()
  const { confirm } = useConfirm()
  const [slides, setSlides] = useState(initialSlides)
  const [editing, setEditing] = useState<HeroSlide | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const busy = isPending || uploading

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<HeroSlideFormValues>({
    resolver: zodResolver(heroSlideSchema),
    defaultValues: EMPTY_SLIDE,
  })

  const values = watch()

  function openAdd() {
    setEditing(null)
    reset(EMPTY_SLIDE)
    setShowForm(true)
  }

  function openEdit(slide: HeroSlide) {
    setEditing(slide)
    reset({
      imageUrl: slide.imageUrl,
      alt: slide.alt,
      eyebrow: slide.eyebrow,
      title: slide.title,
      subtitle: slide.subtitle,
      ctaLabel: slide.ctaLabel,
      ctaTarget: slide.ctaTarget,
      ctaHref: slide.ctaHref,
      published: slide.published,
    })
    setShowForm(true)
  }

  async function handleUpload(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`"${file.name}" depasse 5 Mo. Choisissez une image plus legere.`)
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const upload = await uploadProductImage(formData)
      if (!upload.success) {
        toast.error(upload.error)
        return
      }
      setValue('imageUrl', upload.url, { shouldValidate: true, shouldDirty: true })
      toast.success('Image televersee.')
    } catch {
      toast.error("Impossible de televerser l'image.")
    } finally {
      setUploading(false)
    }
  }

  function onSubmit(form: HeroSlideFormValues) {
    startTransition(async () => {
      const result = editing
        ? await updateHeroSlide(editing.id, form)
        : await createHeroSlide(form)

      if (!result.success) {
        toast.error(result.error)
        return
      }

      setSlides(result.slides)
      setShowForm(false)
      toast.success(editing ? 'Slide enregistre.' : 'Slide ajoute.')
    })
  }

  function handleDelete(slide: HeroSlide) {
    startTransition(async () => {
      const ok = await confirm({
        title: 'Supprimer ce slide ?',
        description: slide.title,
        confirmLabel: 'Supprimer',
        variant: 'destructive',
      })
      if (!ok) return

      const result = await deleteHeroSlide(slide.id)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setSlides(result.slides)
      toast.success('Slide supprime.')
    })
  }

  function handleMove(slide: HeroSlide, direction: 'up' | 'down') {
    startTransition(async () => {
      const result = await moveHeroSlide(slide.id, direction)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setSlides(result.slides)
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Carrousel d accueil : chaque slide a une image, un texte et un bouton anime qui amene vers
          une section (promotions, nouveautes, plus vendus) ou un lien personnalise.
        </p>
        <AdminButton onClick={openAdd} className="inline-flex shrink-0 items-center gap-1">
          <Plus className="size-4" />
          Ajouter un slide
        </AdminButton>
      </div>

      {slides.length === 0 ? (
        <AdminEmptyState message="Aucun slide pour le moment. Ajoutez le premier visuel du carrousel." />
      ) : (
        <div className="space-y-4">
          {slides.map((slide, index) => (
            <div key={slide.id} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="grid gap-0 md:grid-cols-[220px_1fr]">
                <div className="relative aspect-[16/10] bg-slate-100 md:aspect-auto md:min-h-40">
                  {slide.imageUrl ? (
                    <img src={slide.imageUrl} alt={slide.alt || slide.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full min-h-40 items-center justify-center text-sm text-slate-400">
                      Pas d image
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-between p-4">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{slide.title}</p>
                      <AdminBadge tone={slide.published ? 'success' : 'warning'}>
                        {slide.published ? 'Publie' : 'Masque'}
                      </AdminBadge>
                    </div>
                    {slide.eyebrow ? (
                      <p className="text-xs font-medium uppercase tracking-wide text-teal-800">{slide.eyebrow}</p>
                    ) : null}
                    {slide.subtitle ? (
                      <p className="mt-1 text-sm text-slate-600">{slide.subtitle}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-slate-500">
                      Bouton « {slide.ctaLabel} » → {resolveHeroCtaHref(slide)}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1">
                    <AdminIconButton
                      label="Monter"
                      onClick={() => handleMove(slide, 'up')}
                      disabled={busy || index === 0}
                    >
                      <ArrowUp className="size-4" />
                    </AdminIconButton>
                    <AdminIconButton
                      label="Descendre"
                      onClick={() => handleMove(slide, 'down')}
                      disabled={busy || index === slides.length - 1}
                    >
                      <ArrowDown className="size-4" />
                    </AdminIconButton>
                    <AdminIconButton label="Modifier le slide" onClick={() => openEdit(slide)} disabled={busy}>
                      <Pencil className="size-4" />
                    </AdminIconButton>
                    <AdminIconButton
                      label="Supprimer le slide"
                      variant="danger"
                      onClick={() => handleDelete(slide)}
                      disabled={busy}
                    >
                      <Trash2 className="size-4" />
                    </AdminIconButton>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <AdminModal
          title={editing ? 'Modifier le slide' : 'Nouveau slide'}
          onClose={() => !busy && setShowForm(false)}
          className="max-w-xl"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className={adminLabelCls}>IMAGE *</label>
              <div className="mb-3 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                {values.imageUrl ? (
                  <img src={values.imageUrl} alt="" className="h-40 w-full object-cover" />
                ) : (
                  <div className="flex h-40 items-center justify-center text-sm text-slate-400">
                    Aucune image
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={busy}
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) void handleUpload(file)
                }}
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-teal-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-teal-900 hover:file:bg-teal-200 disabled:opacity-60"
              />
              <AdminFieldError message={errors.imageUrl?.message} />
            </div>

            <div>
              <label className={adminLabelCls}>TEXTE ALTERNATIF</label>
              <input className={adminInputWithError(!!errors.alt)} disabled={busy} {...register('alt')} />
              <AdminFieldError message={errors.alt?.message} />
            </div>

            <div>
              <label className={adminLabelCls}>SUR-TITRE</label>
              <input
                className={adminInputWithError(!!errors.eyebrow)}
                disabled={busy}
                placeholder="Offre du moment"
                {...register('eyebrow')}
              />
              <AdminFieldError message={errors.eyebrow?.message} />
            </div>

            <div>
              <label className={adminLabelCls}>TITRE *</label>
              <input className={adminInputWithError(!!errors.title)} disabled={busy} {...register('title')} />
              <AdminFieldError message={errors.title?.message} />
            </div>

            <div>
              <label className={adminLabelCls}>SOUS-TITRE</label>
              <textarea
                rows={3}
                className={`${adminInputWithError(!!errors.subtitle)} resize-none`}
                disabled={busy}
                {...register('subtitle')}
              />
              <AdminFieldError message={errors.subtitle?.message} />
            </div>

            <div>
              <label className={adminLabelCls}>LIBELLE DU BOUTON *</label>
              <input
                className={adminInputWithError(!!errors.ctaLabel)}
                disabled={busy}
                {...register('ctaLabel')}
              />
              <AdminFieldError message={errors.ctaLabel?.message} />
            </div>

            <div>
              <label className={adminLabelCls}>DESTINATION DU BOUTON</label>
              <Controller
                control={control}
                name="ctaTarget"
                render={({ field }) => (
                  <AdminSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    items={HERO_CTA_TARGETS.map((target) => ({
                      value: target.value,
                      label: target.label,
                    }))}
                    disabled={busy}
                    error={!!errors.ctaTarget}
                  />
                )}
              />
              <AdminFieldError message={errors.ctaTarget?.message} />
            </div>

            {values.ctaTarget === 'custom' && (
              <div>
                <label className={adminLabelCls}>LIEN PERSONNALISE *</label>
                <input
                  className={adminInputWithError(!!errors.ctaHref)}
                  disabled={busy}
                  placeholder="/products ou #promotions"
                  {...register('ctaHref')}
                />
                <AdminFieldError message={errors.ctaHref?.message} />
              </div>
            )}

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" className="accent-teal-800" disabled={busy} {...register('published')} />
              Publier ce slide
            </label>

            <AdminButton type="submit" disabled={busy} className="w-full">
              {busy ? 'Enregistrement...' : editing ? 'Enregistrer' : 'Ajouter'}
            </AdminButton>
          </form>
        </AdminModal>
      )}
    </div>
  )
}
