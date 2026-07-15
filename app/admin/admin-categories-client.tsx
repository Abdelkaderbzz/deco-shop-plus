'use client'

import { addCategory, deleteCategory, updateCategory } from '@/app/actions/categories'
import { useToast } from '@/components/toast-provider'
import { useConfirm } from '@/components/confirm-provider'
import { getErrorMessage } from '@/lib/get-error-message'
import { categorySchema, type CategoryFormValues } from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  AdminButton,
  AdminEmptyState,
  AdminFieldError,
  AdminIconButton,
  AdminIconLink,
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
}

const EMPTY_FORM: CategoryFormValues = { name: '', slug: '' }

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
    reset({ name: category.name, slug: category.slug })
    setShowForm(true)
  }

  function onSubmit(values: CategoryFormValues) {
    startTransition(async () => {
      try {
        if (editing) {
          await updateCategory(editing.id, values)
          setCategories((prev) =>
            prev.map((c) => (c.id === editing.id ? { ...c, ...values } : c)),
          )
          toast.success('Categorie modifiee avec succes.')
        } else {
          await addCategory(values)
          toast.success('Categorie ajoutee avec succes.')
          window.location.reload()
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
      description: 'Les produits lies ne seront pas supprimes.',
      confirmLabel: 'Supprimer',
      variant: 'destructive',
    })
    if (!ok) return

    startTransition(async () => {
      try {
        await deleteCategory(id)
        setCategories((prev) => prev.filter((c) => c.id !== id))
        toast.success('Categorie supprimee.')
      } catch (error) {
        toast.error(getErrorMessage(error, 'Impossible de supprimer la categorie.'))
      }
    })
  }

  return (
    <div>
      <div className="mb-6 flex justify-end">
        <AdminButton variant="outline" onClick={openAdd}>
          + Ajouter une categorie
        </AdminButton>
      </div>

      {categories.length === 0 ? (
        <AdminEmptyState message="Aucune categorie. Ajoutez-en une pour organiser vos produits." />
      ) : (
        <AdminTable>
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {['Nom', 'Slug', 'Actions'].map((h) => (
                  <th key={h} className={adminTableHeadCls}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((category) => (
                <tr key={category.id} className="transition-colors hover:bg-slate-50">
                  <td className={`${adminTableCellCls} font-medium`}>{category.name}</td>
                  <td className={adminTableMutedCls}>{category.slug}</td>
                  <td className={adminTableCellCls}>
                    <div className="flex items-center gap-1">
                      <AdminIconButton label="Modifier la categorie" onClick={() => openEdit(category)}>
                        <Pencil className="size-4" />
                      </AdminIconButton>
                      <AdminIconButton
                        label="Supprimer la categorie"
                        variant="danger"
                        onClick={() => handleDelete(category.id)}
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
          onClose={() => setShowForm(false)}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className={adminLabelCls}>NOM *</label>
              <input
                className={adminInputWithError(!!errors.name)}
                placeholder="Ex: Homme"
                {...register('name')}
              />
              <AdminFieldError message={errors.name?.message} />
            </div>
            <div>
              <label className={adminLabelCls}>SLUG (optionnel)</label>
              <input
                className={adminInputWithError(!!errors.slug)}
                placeholder="Ex: parfums"
                {...register('slug')}
              />
              <AdminFieldError message={errors.slug?.message} />
              <p className="mt-1 text-sm text-slate-500">
                Laissez vide pour generer automatiquement depuis le nom.
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
