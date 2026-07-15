'use client'

import { addProduct, deleteProduct, updateProduct } from '@/app/actions/products'
import { useToast } from '@/components/toast-provider'
import { useConfirm } from '@/components/confirm-provider'
import { getErrorMessage } from '@/lib/get-error-message'
import { getPrimaryImage, parseProductImages, serializeProductImages } from '@/lib/product-images'
import { productSchema, type ProductFormValues } from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  AdminBadge,
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
import { AdminSelect } from './admin-select'
import { ProductImagesField } from './product-images-field'

type Product = {
  id: number
  name: string
  brand: string
  description: string | null
  price: string
  category: string
  imageUrl: string | null
  images: string | null
  sizes: string
  inStock: boolean
  featured: boolean
}

type Category = {
  id: number
  name: string
  slug: string
}

const EMPTY_FORM: ProductFormValues = {
  name: '',
  brand: '',
  description: '',
  price: '',
  category: 'unisex',
  images: [],
  sizes: '',
  inStock: true,
  featured: false,
}

export function AdminProductsClient({
  initialProducts,
  categories,
}: {
  initialProducts: Product[]
  categories: Category[]
}) {
  const toast = useToast()
  const { confirm } = useConfirm()
  const [products, setProducts] = useState(initialProducts)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isPending, startTransition] = useTransition()

  const defaultCategory = categories[0]?.slug ?? 'unisex'

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { ...EMPTY_FORM, category: defaultCategory },
  })

  const images = watch('images')

  const filtered = products.filter((p) => {
    const q = search.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    )
  })

  function openAdd() {
    setEditingProduct(null)
    reset({ ...EMPTY_FORM, category: defaultCategory })
    setShowForm(true)
  }

  function openEdit(product: Product) {
    setEditingProduct(product)
    reset({
      name: product.name,
      brand: product.brand,
      description: product.description ?? '',
      price: product.price,
      category: product.category,
      images: parseProductImages(product),
      sizes: JSON.parse(product.sizes || '[]').join(', '),
      inStock: product.inStock,
      featured: product.featured,
    })
    setShowForm(true)
  }

  function onSubmit(form: ProductFormValues) {
    const sizesArr = form.sizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const serializedImages = serializeProductImages(form.images)
    const primaryImage = getPrimaryImage({ images: serializedImages })

    startTransition(async () => {
      try {
        if (editingProduct) {
          await updateProduct(editingProduct.id, {
            name: form.name,
            brand: form.brand,
            description: form.description,
            price: form.price,
            category: form.category,
            images: form.images,
            sizes: sizesArr,
            inStock: form.inStock,
            featured: form.featured,
          })
          setProducts((prev) =>
            prev.map((p) =>
              p.id === editingProduct.id
                ? {
                    ...p,
                    ...form,
                    description: form.description || null,
                    images: serializedImages,
                    imageUrl: primaryImage,
                    sizes: JSON.stringify(sizesArr),
                  }
                : p,
            ),
          )
          toast.success('Produit modifie avec succes.')
        } else {
          await addProduct({
            name: form.name,
            brand: form.brand,
            description: form.description,
            price: form.price,
            category: form.category,
            images: form.images,
            sizes: sizesArr,
            inStock: form.inStock,
            featured: form.featured,
          })
          toast.success('Produit ajoute avec succes.')
          window.location.reload()
        }
        setShowForm(false)
      } catch (error) {
        toast.error(getErrorMessage(error, "Impossible d'enregistrer le produit."))
      }
    })
  }

  async function handleDelete(id: number) {
    const ok = await confirm({
      title: 'Supprimer ce produit ?',
      description: 'Cette action est irreversible.',
      confirmLabel: 'Supprimer',
      variant: 'destructive',
    })
    if (!ok) return

    startTransition(async () => {
      try {
        await deleteProduct(id)
        setProducts((prev) => prev.filter((p) => p.id !== id))
        toast.success('Produit supprime.')
      } catch (error) {
        toast.error(getErrorMessage(error, 'Impossible de supprimer le produit.'))
      }
    })
  }

  function categoryLabel(slug: string) {
    return categories.find((c) => c.slug === slug)?.name ?? slug
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${adminInputWithError(false)} max-w-sm`}
        />
        <AdminButton variant="outline" onClick={openAdd}>
          + Ajouter un produit
        </AdminButton>
      </div>

      {filtered.length === 0 ? (
        <AdminEmptyState message="Aucun produit trouve." />
      ) : (
        <AdminTable>
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {['Image', 'Nom', 'Marque', 'Categorie', 'Prix', 'Stock', 'Actions'].map((h) => (
                  <th key={h} className={adminTableHeadCls}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => {
                const primaryImage = getPrimaryImage(p)
                const imageCount = parseProductImages(p).length

                return (
                <tr key={p.id} className="transition-colors hover:bg-slate-50">
                  <td className={adminTableCellCls}>
                    {primaryImage ? (
                      <div className="relative">
                        <img src={primaryImage} alt={p.name} className="h-12 w-10 rounded object-cover" />
                        {imageCount > 1 && (
                          <span className="absolute -bottom-1 -right-1 rounded bg-slate-800 px-1 text-[10px] text-white">
                            +{imageCount - 1}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="h-12 w-10 rounded bg-slate-200" />
                    )}
                  </td>
                  <td className={adminTableCellCls}>
                    <p className="font-medium text-slate-900">{p.name}</p>
                    {p.featured && <AdminBadge tone="info">Mis en avant</AdminBadge>}
                  </td>
                  <td className={adminTableMutedCls}>{p.brand}</td>
                  <td className={adminTableMutedCls}>{categoryLabel(p.category)}</td>
                  <td className={`${adminTableCellCls} font-semibold`}>
                    {parseFloat(p.price).toFixed(3)} TND
                  </td>
                  <td className={adminTableCellCls}>
                    <AdminBadge tone={p.inStock ? 'success' : 'danger'}>
                      {p.inStock ? 'En stock' : 'Rupture'}
                    </AdminBadge>
                  </td>
                  <td className={adminTableCellCls}>
                    <div className="flex items-center gap-1">
                      <AdminIconLink
                        href={`/products/${p.id}`}
                        label="Voir sur la boutique"
                        variant="accent"
                        external
                      >
                        <ExternalLink className="size-4" />
                      </AdminIconLink>
                      <AdminIconButton label="Modifier le produit" onClick={() => openEdit(p)}>
                        <Pencil className="size-4" />
                      </AdminIconButton>
                      <AdminIconButton
                        label="Supprimer le produit"
                        variant="danger"
                        onClick={() => handleDelete(p.id)}
                      >
                        <Trash2 className="size-4" />
                      </AdminIconButton>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
        </AdminTable>
      )}

      {showForm && (
        <AdminModal
          title={editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
          onClose={() => setShowForm(false)}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className={adminLabelCls}>NOM *</label>
              <input type="text" className={adminInputWithError(!!errors.name)} {...register('name')} />
              <AdminFieldError message={errors.name?.message} />
            </div>
            <div>
              <label className={adminLabelCls}>MARQUE *</label>
              <input type="text" className={adminInputWithError(!!errors.brand)} {...register('brand')} />
              <AdminFieldError message={errors.brand?.message} />
            </div>
            <div>
              <label className={adminLabelCls}>PRIX (TND) *</label>
              <input
                type="number"
                step="0.001"
                className={adminInputWithError(!!errors.price)}
                {...register('price')}
              />
              <AdminFieldError message={errors.price?.message} />
            </div>
            <ProductImagesField
              value={images}
              onChange={(urls) => setValue('images', urls, { shouldValidate: true })}
              error={errors.images?.message}
            />
            <div>
              <label className={adminLabelCls}>TAILLES (ex: 50ml, 100ml)</label>
              <input type="text" className={adminInputWithError(!!errors.sizes)} {...register('sizes')} />
              <AdminFieldError message={errors.sizes?.message} />
            </div>

            <div>
              <label className={adminLabelCls}>DESCRIPTION</label>
              <textarea
                rows={3}
                className={`${adminInputWithError(!!errors.description)} resize-none`}
                {...register('description')}
              />
              <AdminFieldError message={errors.description?.message} />
            </div>

            <div>
              <label className={adminLabelCls}>CATEGORIE</label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <AdminSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    items={categories.map((category) => ({
                      value: category.slug,
                      label: category.name,
                    }))}
                    error={!!errors.category}
                  />
                )}
              />
              <AdminFieldError message={errors.category?.message} />
            </div>

            <div className="flex gap-6">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" className="accent-amber-700" {...register('inStock')} />
                En stock
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" className="accent-amber-700" {...register('featured')} />
                Mis en avant
              </label>
            </div>

            <AdminButton type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Enregistrement...' : editingProduct ? 'Enregistrer' : 'Ajouter'}
            </AdminButton>
          </form>
        </AdminModal>
      )}
    </div>
  )
}
