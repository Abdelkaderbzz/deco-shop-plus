'use client'

import { addCategory, deleteCategory, updateCategory } from '@/app/actions/categories'
import { useToast } from '@/components/toast-provider'
import { useConfirm } from '@/components/confirm-provider'
import { getErrorMessage } from '@/lib/get-error-message'
import { categorySchema, type CategoryFormValues } from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pencil, Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { CategoryBannerField } from './category-banner-field'
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

type Category = {
  id: number
  name: string
  slug: string
  bannerUrl: string | null
}

const EMPTY_FORM: CategoryFormValues = { name: '', slug: '', bannerUrl: '' }

export function AdminCategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const toast = useToast()
  const { confirm } = useConfirm()
  const [categories, setCategories] = useState(initialCategories)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: EMPTY_FORM,
  })

  function openAdd() {
    setEditing(null)
    reset(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(category: Category) {
    setEditing(category)
    reset({
      name: category.name,
      slug: category.slug,
      bannerUrl: category.bannerUrl ?? '',
    })
    setShowForm(true)
  }

  function onSubmit(values: CategoryFormValues) {
    const payload = {
      name: values.name,
      slug: values.slug,
      bannerUrl: values.bannerUrl?.trim() || null,
    }

    startTransition(async () => {
      try {
        if (editing) {
          const result = await updateCategory(editing.id, payload)
          if (!result.success) {
            toast.error(result.error)
            return
          }
          setCategories((prev) =>
            prev.map((category) =>
              category.id === editing.id
                ? {
                    ...category,
                    name: payload.name,
                    slug: payload.slug || category.slug,
                    bannerUrl: payload.bannerUrl,
                  }
                : category,
            ),
          )
          toast.success('Categorie modifiee avec succes.')
        } else {
          const result = await addCategory(payload)
          if (!result.success) {
            toast.error(result.error)
            return
          }
          if (result.category) {
            setCategories((prev) =>
              [...prev, result.category!].sort((a, b) => a.name.localeCompare(b.name)),
            )
          }
          toast.success('Categorie ajoutee avec succes.')
        }
        setShowForm(false)
      } catch (error) {
        toast.error(getErrorMessage(error, "Impossible d'enregistrer la categorie."))
      }
    })
  }

  async function handleDelete(id: number) {
    const ok = await confirm({
      title: 'Supprimer cette categorie ?',
      description:
        'Impossible si des produits utilisent encore cette categorie. Les produits ne seront pas supprimes.',
      confirmLabel: 'Supprimer',
      variant: 'destructive',
    })
    if (!ok) return

    startTransition(async () => {
      try {
        const result = await deleteCategory(id)
        if (!result.success) {
          toast.error(result.error)
          return
        }
        setCategories((prev) => prev.filter((category) => category.id !== id))
        toast.success('Categorie supprimee.')
      } catch (error) {
        toast.error(getErrorMessage(error, 'Impossible de supprimer la categorie.'))
      }
    })
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <AdminButton variant="outline" onClick={openAdd} disabled={isPending}>
          + Ajouter une categorie
        </AdminButton>
      </div>

      {categories.length === 0 ? (
        <AdminEmptyState message="Aucune categorie. Ajoutez-en une pour organiser vos produits." />
      ) : (
        <AdminTable loading={isPending} loadingLabel="Mise a jour des categories...">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              {['Banniere', 'Nom', 'Slug', 'Actions'].map((heading) => (
                <th key={heading} className={adminTableHeadCls}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((category) => (
              <tr key={category.id} className="transition-colors hover:bg-slate-50">
                <td className={adminTableCellCls}>
                  {category.bannerUrl ? (
                    <img
                      src={category.bannerUrl}
                      alt={category.name}
                      className="h-14 w-24 rounded object-cover"
                    />
                  ) : (
                    <span className="text-sm text-slate-400">Aucune</span>
                  )}
                </td>
                <td className={`${adminTableCellCls} font-medium`}>{category.name}</td>
                <td className={adminTableMutedCls}>{category.slug}</td>
                <td className={adminTableCellCls}>
                  <div className="flex items-center gap-1">
                    <AdminIconButton
                      label="Modifier la categorie"
                      onClick={() => openEdit(category)}
                      disabled={isPending}
                    >
                      <Pencil className="size-4" />
                    </AdminIconButton>
                    <AdminIconButton
                      label="Supprimer la categorie"
                      variant="danger"
                      onClick={() => handleDelete(category.id)}
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
          title={editing ? 'Modifier la categorie' : 'Nouvelle categorie'}
          onClose={() => !isPending && setShowForm(false)}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className={adminLabelCls}>NOM *</label>
              <input
                className={adminInputWithError(!!errors.name)}
                placeholder="Ex: Parfums"
                disabled={isPending}
                {...register('name')}
              />
              <AdminFieldError message={errors.name?.message} />
            </div>
            <div>
              <label className={adminLabelCls}>SLUG (optionnel)</label>
              <input
                className={adminInputWithError(!!errors.slug)}
                placeholder="Ex: parfums"
                disabled={isPending}
                {...register('slug')}
              />
              <AdminFieldError message={errors.slug?.message} />
              <p className="mt-1 text-sm text-slate-500">
                Laissez vide pour generer automatiquement depuis le nom.
              </p>
            </div>

            <Controller
              name="bannerUrl"
              control={control}
              render={({ field }) => (
                <CategoryBannerField value={field.value ?? ''} onChange={field.onChange} />
              )}
            />
            <AdminFieldError message={errors.bannerUrl?.message} />

            <AdminButton type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Enregistrement...' : editing ? 'Enregistrer' : 'Ajouter'}
            </AdminButton>
          </form>
        </AdminModal>
      )}
    </div>
  )
}
