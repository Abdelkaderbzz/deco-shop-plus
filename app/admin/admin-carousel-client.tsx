'use client'

import {
  addCarouselVideo,
  deleteCarouselVideo,
  moveCarouselVideo,
  updateCarouselVideo,
} from '@/app/actions/carousel'
import { useConfirm } from '@/components/confirm-provider'
import { useToast } from '@/components/toast-provider'
import { extractInstagramReelId } from '@/lib/carousel-videos'
import { carouselVideoSchema, type CarouselVideoFormValues } from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowDown, ArrowUp, ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import {
  AdminButton,
  AdminEmptyState,
  AdminFieldError,
  AdminIconButton,
  AdminModal,
  AdminTable,
  adminInputWithError,
  adminLabelCls,
  adminTableCellCls,
  adminTableHeadCls,
  adminTableMutedCls,
} from './admin-ui'

type CarouselVideo = {
  id: number
  url: string
  sortOrder: number
}

const EMPTY_FORM: CarouselVideoFormValues = { url: '' }

export function AdminCarouselClient({ initialVideos }: { initialVideos: CarouselVideo[] }) {
  const router = useRouter()
  const toast = useToast()
  const { confirm } = useConfirm()
  const [videos, setVideos] = useState(initialVideos)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<CarouselVideo | null>(null)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CarouselVideoFormValues>({
    resolver: zodResolver(carouselVideoSchema),
    defaultValues: EMPTY_FORM,
  })

  function openAdd() {
    setEditing(null)
    reset(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(video: CarouselVideo) {
    setEditing(video)
    reset({ url: video.url })
    setShowForm(true)
  }

  function onSubmit(values: CarouselVideoFormValues) {
    startTransition(async () => {
      const result = editing
        ? await updateCarouselVideo(editing.id, values.url)
        : await addCarouselVideo(values.url)

      if (!result.success) {
        toast.error(result.error)
        return
      }

      if (result.video) {
        setVideos((prev) =>
          editing
            ? prev.map((video) => (video.id === result.video!.id ? result.video! : video))
            : [...prev, result.video!].sort((a, b) => a.sortOrder - b.sortOrder),
        )
      }

      setShowForm(false)
      reset(EMPTY_FORM)
      toast.success(editing ? 'Video modifiee avec succes.' : 'Video ajoutee avec succes.')
      router.refresh()
    })
  }

  async function handleDelete(id: number) {
    const ok = await confirm({
      title: 'Supprimer cette video ?',
      description: 'Elle sera retiree du carousel sur la page d accueil.',
      confirmLabel: 'Supprimer',
      variant: 'destructive',
    })
    if (!ok) return

    startTransition(async () => {
      const result = await deleteCarouselVideo(id)
      if (!result.success) {
        toast.error(result.error)
        return
      }

      setVideos(result.videos ?? [])
      toast.success('Video supprimee.')
      router.refresh()
    })
  }

  function handleMove(id: number, direction: 'up' | 'down') {
    startTransition(async () => {
      const result = await moveCarouselVideo(id, direction)
      if (!result.success) {
        toast.error(result.error)
        return
      }

      if (result.videos) {
        setVideos(result.videos)
      }
      router.refresh()
    })
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <AdminButton variant="outline" onClick={openAdd} disabled={isPending}>
          + Ajouter une video
        </AdminButton>
      </div>

      {videos.length === 0 ? (
        <AdminEmptyState message="Aucune video dans le carousel. Ajoutez des liens Instagram reel." />
      ) : (
        <AdminTable loading={isPending} loadingLabel="Mise a jour du carousel...">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              {['Ordre', 'Lien', 'Reel ID', 'Actions'].map((heading) => (
                <th key={heading} className={adminTableHeadCls}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {videos.map((video, index) => (
              <tr key={video.id} className="transition-colors hover:bg-slate-50">
                <td className={`${adminTableCellCls} w-16 font-medium`}>{index + 1}</td>
                <td className={adminTableCellCls}>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-md items-center gap-1 truncate text-sm text-amber-800 hover:underline"
                  >
                    <span className="truncate">{video.url}</span>
                    <ExternalLink className="size-3.5 shrink-0" />
                  </a>
                </td>
                <td className={adminTableMutedCls}>{extractInstagramReelId(video.url) || '—'}</td>
                <td className={adminTableCellCls}>
                  <div className="flex items-center gap-1">
                    <AdminIconButton
                      label="Monter"
                      onClick={() => handleMove(video.id, 'up')}
                      disabled={index === 0 || isPending}
                    >
                      <ArrowUp className="size-4" />
                    </AdminIconButton>
                    <AdminIconButton
                      label="Descendre"
                      onClick={() => handleMove(video.id, 'down')}
                      disabled={index === videos.length - 1 || isPending}
                    >
                      <ArrowDown className="size-4" />
                    </AdminIconButton>
                    <AdminIconButton
                      label="Modifier la video"
                      onClick={() => openEdit(video)}
                      disabled={isPending}
                    >
                      <Pencil className="size-4" />
                    </AdminIconButton>
                    <AdminIconButton
                      label="Supprimer la video"
                      variant="danger"
                      onClick={() => handleDelete(video.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="size-4" />
                    </AdminIconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      )}

      {showForm && (
        <AdminModal
          title={editing ? 'Modifier la video' : 'Nouvelle video'}
          onClose={() => !isPending && setShowForm(false)}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className={adminLabelCls}>LIEN INSTAGRAM REEL *</label>
              <input
                className={adminInputWithError(!!errors.url)}
                placeholder="https://www.instagram.com/reel/..."
                disabled={isPending}
                {...register('url')}
              />
              <AdminFieldError message={errors.url?.message} />
              <p className="mt-2 text-sm text-slate-500">
                Collez le lien complet d un reel Instagram. Il sera affiche dans le carousel de la page
                d accueil.
              </p>
            </div>

            <AdminButton type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Enregistrement...' : editing ? 'Enregistrer' : 'Ajouter'}
            </AdminButton>
          </form>
        </AdminModal>
      )}
    </div>
  )
}
