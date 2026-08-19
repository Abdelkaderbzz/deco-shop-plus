'use client'

import { addProduct, deleteProduct, updateProduct } from '@/app/actions/products'
import { useToast } from '@/components/toast-provider'
import { useConfirm } from '@/components/confirm-provider'
import { getErrorMessage } from '@/lib/get-error-message'
import { getPrimaryImage, parseProductImages } from '@/lib/product-images'
import { parseRelatedProductIds } from '@/lib/product-relations'
import {
  DEFAULT_PROMO_BG,
  DEFAULT_PROMO_LABEL,
  DEFAULT_PROMO_TEXT,
  parseProductColors,
} from '@/lib/product-colors'
import { formatPriceTnd, getDiscountPercent, parsePrice } from '@/lib/product-price'
import { productSchema, type ProductFormValues } from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouteTransition } from '@/lib/use-route-transition'
import { ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
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
import { ProductColorsField } from './product-colors-field'
import { RelatedProductsField, type ProductOption } from './related-products-field'
import { ADMIN_PAGE_SIZE, AdminPagination } from './admin-pagination'

type Product = {
  id: number
  name: string
  brand: string
  description: string | null
  price: string
  compareAtPrice: string | null
  category: string
  imageUrl: string | null
  images: string | null
  sizes: string
  colors?: string
  relatedProductIds: string
  inStock: boolean
  featured: boolean
  published: boolean
  promoEnabled?: boolean
  promoLabel?: string
  promoBgColor?: string
  promoTextColor?: string
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
  compareAtPrice: '',
  category: 'coussins',
  images: [],
  sizes: '',
  colors: [],
  relatedProductIds: [],
  inStock: true,
  featured: false,
  published: true,
  promoEnabled: false,
  promoLabel: DEFAULT_PROMO_LABEL,
  promoBgColor: DEFAULT_PROMO_BG,
  promoTextColor: DEFAULT_PROMO_TEXT,
}

export function AdminProductsClient({
  products,
  total,
  page,
  search: initialSearch,
  categories,
  productOptions,
}: {
  products: Product[]
  total: number
  page: number
  search: string
  categories: Category[]
  productOptions: ProductOption[]
}) {
  const { isPending: isNavigating, push, refresh } = useRouteTransition()
  const toast = useToast()
  const { confirm } = useConfirm()
  const [searchInput, setSearchInput] = useState(initialSearch)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isPending, startTransition] = useTransition()
  const isBusy = isPending || isNavigating

  const defaultCategory = categories[0]?.slug ?? 'coussins'

  useEffect(() => {
    setSearchInput(initialSearch)
  }, [initialSearch])

  function navigate(nextSearch: string, nextPage: number) {
    const params = new URLSearchParams()
    if (nextSearch.trim()) params.set('search', nextSearch.trim())
    if (nextPage > 1) params.set('page', String(nextPage))
    const query = params.toString()
    push(query ? `/admin/products?${query}` : '/admin/products')
  }

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
  const relatedProductIds = watch('relatedProductIds')
  const colors = watch('colors')
  const promoEnabled = watch('promoEnabled')
  const watchedPrice = watch('price')
  const watchedCompareAt = watch('compareAtPrice')
  const previewDiscount = getDiscountPercent(watchedPrice, watchedCompareAt)

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
      compareAtPrice: product.compareAtPrice ?? '',
      category: product.category,
      images: parseProductImages(product),
      sizes: JSON.parse(product.sizes || '[]').join(', '),
      colors: parseProductColors(product),
      relatedProductIds: parseRelatedProductIds(product),
      inStock: product.inStock,
      featured: product.featured,
      published: product.published ?? true,
      promoEnabled: product.promoEnabled ?? false,
      promoLabel: product.promoLabel || DEFAULT_PROMO_LABEL,
      promoBgColor: product.promoBgColor || DEFAULT_PROMO_BG,
      promoTextColor: product.promoTextColor || DEFAULT_PROMO_TEXT,
    })
    setShowForm(true)
  }

  function onSubmit(form: ProductFormValues) {
    const sizesArr = form.sizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    const compareAtPrice = form.compareAtPrice?.trim() || null

    startTransition(async () => {
      try {
        if (editingProduct) {
          await updateProduct(editingProduct.id, {
            name: form.name,
            brand: form.brand,
            description: form.description,
            price: form.price,
            compareAtPrice,
            category: form.category,
            images: form.images,
            sizes: sizesArr,
            colors: form.colors.filter((color) => color.name.trim()),
            relatedProductIds: form.relatedProductIds,
            inStock: form.inStock,
            featured: form.featured,
            published: form.published,
            promoEnabled: form.promoEnabled,
            promoLabel: form.promoLabel,
            promoBgColor: form.promoBgColor,
            promoTextColor: form.promoTextColor,
          })
          toast.success('Produit modifie avec succes.')
        } else {
          await addProduct({
            name: form.name,
            brand: form.brand,
            description: form.description,
            price: form.price,
            compareAtPrice,
            category: form.category,
            images: form.images,
            sizes: sizesArr,
            colors: form.colors.filter((color) => color.name.trim()),
            relatedProductIds: form.relatedProductIds,
            inStock: form.inStock,
            featured: form.featured,
            published: form.published,
            promoEnabled: form.promoEnabled,
            promoLabel: form.promoLabel,
            promoBgColor: form.promoBgColor,
            promoTextColor: form.promoTextColor,
          })
          toast.success('Produit ajoute avec succes.')
        }
        setShowForm(false)
        refresh()
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
        toast.success('Produit supprime.')
        refresh()
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
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
              navigate(searchInput, 1)
            }
          }}
          className={`${adminInputWithError(false)} max-w-sm`}
          disabled={isNavigating}
        />
        <AdminButton variant="outline" onClick={openAdd} disabled={isBusy}>
          + Ajouter un produit
        </AdminButton>
      </div>

      {total === 0 ? (
        <AdminEmptyState message="Aucun produit trouve." />
      ) : (
        <AdminTable loading={isBusy} loadingLabel={isNavigating ? 'Chargement des produits...' : 'Mise a jour...'}>
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {['Image', 'Nom', 'Marque', 'Categorie', 'Prix', 'Stock', 'Statut', 'Actions'].map((h) => (
                  <th key={h} className={adminTableHeadCls}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => {
                const primaryImage = getPrimaryImage(p)
                const imageCount = parseProductImages(p).length
                const discount = getDiscountPercent(p.price, p.compareAtPrice)
                const compareAt = parsePrice(p.compareAtPrice)

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
                    {p.promoEnabled && (
                      <AdminBadge tone="warning">{p.promoLabel || DEFAULT_PROMO_LABEL}</AdminBadge>
                    )}
                  </td>
                  <td className={adminTableMutedCls}>{p.brand}</td>
                  <td className={adminTableMutedCls}>{categoryLabel(p.category)}</td>
                  <td className={adminTableCellCls}>
                    <p className="font-semibold text-slate-900">
                      {formatPriceTnd(parseFloat(p.price))} TND
                    </p>
                    {discount != null && compareAt != null && (
                      <p className="mt-0.5 text-xs text-slate-500">
                        <span className="line-through">{formatPriceTnd(compareAt)} TND</span>
                        <span className="ml-1.5 font-medium text-emerald-700">-{discount}%</span>
                      </p>
                    )}
                  </td>
                  <td className={adminTableCellCls}>
                    <AdminBadge tone={p.inStock ? 'success' : 'danger'}>
                      {p.inStock ? 'En stock' : 'Épuisé'}
                    </AdminBadge>
                  </td>
                  <td className={adminTableCellCls}>
                    <AdminBadge tone={p.published !== false ? 'success' : 'warning'}>
                      {p.published !== false ? 'Visible' : 'Masque'}
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
                      <AdminIconButton label="Modifier le produit" onClick={() => openEdit(p)} disabled={isBusy}>
                        <Pencil className="size-4" />
                      </AdminIconButton>
                      <AdminIconButton
                        label="Supprimer le produit"
                        variant="danger"
                        onClick={() => handleDelete(p.id)}
                        disabled={isBusy}
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

      {total > 0 && (
        <AdminPagination
          page={page}
          pageSize={ADMIN_PAGE_SIZE}
          totalItems={total}
          loading={isNavigating}
          onPageChange={(nextPage) => navigate(searchInput, nextPage)}
        />
      )}

      {showForm && (
        <AdminModal
          title={editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
          onClose={() => !isPending && setShowForm(false)}
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={adminLabelCls}>PRIX ACTUEL (TND) *</label>
                <input
                  type="number"
                  step="0.001"
                  className={adminInputWithError(!!errors.price)}
                  {...register('price')}
                />
                <AdminFieldError message={errors.price?.message} />
              </div>
              <div>
                <label className={adminLabelCls}>ANCIEN PRIX (TND)</label>
                <input
                  type="number"
                  step="0.001"
                  placeholder="Optionnel — pour une promo"
                  className={adminInputWithError(!!errors.compareAtPrice)}
                  {...register('compareAtPrice', {
                    setValueAs: (value) => (value == null || value === '' ? '' : String(value)),
                  })}
                />
                <AdminFieldError message={errors.compareAtPrice?.message} />
                {previewDiscount != null && (
                  <p className="mt-1 text-xs font-medium text-emerald-700">
                    Remise affichee : -{previewDiscount}%
                  </p>
                )}
              </div>
            </div>
            <ProductImagesField
              value={images}
              onChange={(urls) => setValue('images', urls, { shouldValidate: true })}
              error={errors.images?.message}
            />
            <div>
              <label className={adminLabelCls}>TAILLES (ex: 45x45, Unique)</label>
              <input type="text" className={adminInputWithError(!!errors.sizes)} {...register('sizes')} />
              <AdminFieldError message={errors.sizes?.message} />
            </div>

            <ProductColorsField
              value={colors}
              onChange={(next) => setValue('colors', next, { shouldValidate: true, shouldDirty: true })}
              error={errors.colors?.message || errors.colors?.root?.message}
            />

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" className="accent-amber-700" {...register('promoEnabled')} />
                Afficher un tag promotion
              </label>
              {promoEnabled && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className={adminLabelCls}>LIBELLE DU TAG</label>
                    <input
                      type="text"
                      placeholder="Promotion"
                      className={adminInputWithError(!!errors.promoLabel)}
                      {...register('promoLabel')}
                    />
                    <AdminFieldError message={errors.promoLabel?.message} />
                  </div>
                  <div>
                    <label className={adminLabelCls}>COULEUR DU TAG</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="size-10 shrink-0 cursor-pointer rounded-md border border-slate-300 bg-white p-1"
                        value={watch('promoBgColor')}
                        onChange={(event) =>
                          setValue('promoBgColor', event.target.value, { shouldDirty: true })
                        }
                      />
                      <input
                        className={adminInputWithError(!!errors.promoBgColor)}
                        {...register('promoBgColor')}
                      />
                    </div>
                    <AdminFieldError message={errors.promoBgColor?.message} />
                  </div>
                  <div>
                    <label className={adminLabelCls}>COULEUR DU TEXTE</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="size-10 shrink-0 cursor-pointer rounded-md border border-slate-300 bg-white p-1"
                        value={watch('promoTextColor')}
                        onChange={(event) =>
                          setValue('promoTextColor', event.target.value, { shouldDirty: true })
                        }
                      />
                      <input
                        className={adminInputWithError(!!errors.promoTextColor)}
                        {...register('promoTextColor')}
                      />
                    </div>
                    <AdminFieldError message={errors.promoTextColor?.message} />
                  </div>
                </div>
              )}
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

            <RelatedProductsField
              value={relatedProductIds}
              onChange={(ids) => setValue('relatedProductIds', ids, { shouldValidate: true })}
              options={productOptions}
              excludeId={editingProduct?.id}
              error={errors.relatedProductIds?.message}
            />

            <div>
              <label className={adminLabelCls}>STATUT</label>
              <Controller
                control={control}
                name="published"
                render={({ field }) => (
                  <AdminSelect
                    value={field.value ? 'visible' : 'hidden'}
                    onValueChange={(v) => field.onChange(v === 'visible')}
                    items={[
                      { value: 'visible', label: 'Visible en boutique' },
                      { value: 'hidden', label: 'Masque' },
                    ]}
                  />
                )}
              />
              <p className="mt-1 text-xs text-slate-500">
                Les produits masques n&apos;apparaissent pas sur la boutique.
              </p>
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
