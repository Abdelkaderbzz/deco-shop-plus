'use client'

import { createOrder } from '@/app/actions/orders'
import { useCart } from '@/components/cart-context'
import { ProductPrice } from '@/components/product-price'
import { ProductBundleOptions } from '@/components/product-bundle-options'
import { useToast } from '@/components/toast-provider'
import { getErrorMessage } from '@/lib/get-error-message'
import type { ProductColor } from '@/lib/product-colors'
import { lineStockUnits, type ProductBundle } from '@/lib/product-bundles'
import { formatPriceTnd, parsePrice } from '@/lib/product-price'
import { hasVariableSizePrices, priceForSize, type ProductSize } from '@/lib/product-sizes'
import { stockLabel } from '@/lib/product-stock'
import { SITE } from '@/lib/site'
import { whatsappMessageUrl } from '@/lib/social-links'
import { StoreSelect } from '@/components/store-select'
import { getGovernorateLabel, GOVERNORATE_SELECT_OPTIONS } from '@/lib/tunisia-governorates'
import { productOrderSchema, type ProductOrderFormValues } from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState, type MouseEvent } from 'react'
import { Controller, useForm } from 'react-hook-form'

type Product = {
  id: number
  name: string
  brand: string
  price: string
  compareAtPrice?: string | null
  imageUrl: string | null
}

const fieldLabelCls = 'mb-1.5 block text-sm font-semibold text-foreground'
const fieldInputCls =
  'w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20'
const fieldInputErrorCls =
  'w-full rounded-xl border-2 border-destructive bg-card px-4 py-3 text-base text-foreground outline-none focus:border-destructive focus:ring-2 focus:ring-destructive/20'

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="mt-1.5 text-sm font-medium text-destructive">
      {message}
    </p>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  )
}

export function AddToCartButton({
  product,
  sizes,
  colors,
  bundles,
  stock,
  accentColor,
}: {
  product: Product
  sizes: ProductSize[]
  colors: ProductColor[]
  bundles: ProductBundle[]
  stock: number
  accentColor?: string | null
}) {
  const { addItem, items } = useCart()
  const router = useRouter()
  const toast = useToast()
  const fallbackPrice = parsePrice(product.price) ?? 0
  const sizeOptions = sizes.length > 0 ? sizes : [{ name: 'Unique', price: fallbackPrice }]
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0]?.name ?? '')
  const [selectedColor, setSelectedColor] = useState(colors[0]?.name ?? '')
  const [selectedBundleName, setSelectedBundleName] = useState(bundles[0]?.name ?? '')
  const [added, setAdded] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductOrderFormValues>({
    resolver: zodResolver(productOrderSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      customerGovernorate: '',
      customerAddress: '',
      notes: '',
    },
  })

  const selectedBundle = bundles.find((bundle) => bundle.name === selectedBundleName) ?? bundles[0]
  const selectedUnits = selectedBundle?.units ?? 1
  const sizePrice = priceForSize(sizeOptions, selectedSize, fallbackPrice)
  const selectedPrice = selectedBundle?.price ?? sizePrice
  const selectedCompareAt = selectedBundle
    ? selectedBundle.compareAtPrice != null
      ? selectedBundle.compareAtPrice.toFixed(3)
      : null
    : product.compareAtPrice
  const showSizePrices = hasVariableSizePrices(sizeOptions) && bundles.length === 0
  const inCart = items
    .filter((item) => item.productId === product.id)
    .reduce((sum, item) => sum + lineStockUnits(item.quantity, item.bundleUnits), 0)
  const remaining = Math.max(0, stock - inCart)
  const canSelect =
    Boolean(selectedSize) &&
    (colors.length === 0 || Boolean(selectedColor)) &&
    remaining >= selectedUnits

  function orderItem() {
    return {
      productId: product.id,
      productName: product.name,
      productBrand: product.brand,
      size: selectedSize,
      color: selectedColor,
      bundle: selectedBundle?.name ?? '',
      bundleUnits: selectedUnits,
      quantity: 1,
      price: selectedPrice,
    }
  }

  function handleAddToCart() {
    if (!canSelect) return
    addItem({
      ...orderItem(),
      imageUrl: product.imageUrl ?? undefined,
      stock,
    })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 2000)
  }

  function buildWhatsAppMessage(values: ProductOrderFormValues) {
    const lines = [
      `Bonjour ${SITE.name},`,
      'Je souhaite commander :',
      '',
      `Produit : ${product.name}`,
      `Marque : ${product.brand}`,
      selectedSize
        ? `${/\d+\s*cm/i.test(selectedSize) ? 'Dimensions' : 'Taille / format'} : ${selectedSize}`
        : null,
      selectedColor ? `Couleur : ${selectedColor}` : null,
      selectedBundle ? `Pack : ${selectedBundle.name} (${selectedBundle.units} pcs)` : null,
      `Prix : ${formatPriceTnd(selectedPrice)} TND`,
      '',
      values.customerName.trim() ? `Nom complet : ${values.customerName.trim()}` : null,
      values.customerPhone.trim() ? `Telephone : ${values.customerPhone.trim()}` : null,
      values.customerGovernorate
        ? `Gouvernorat : ${getGovernorateLabel(values.customerGovernorate) ?? values.customerGovernorate}`
        : null,
      values.customerAddress.trim() ? `Adresse : ${values.customerAddress.trim()}` : null,
    ].filter((line): line is string => line !== null)

    const note = values.notes.trim()
    if (note) lines.push(`Note : ${note}`)

    return lines.join('\n')
  }

  async function onCommander(values: ProductOrderFormValues) {
    if (!canSelect) {
      toast.error(remaining <= 0 ? 'Plus de stock pour ce produit.' : 'Choisissez la taille et la couleur.')
      return
    }

    try {
      const orderId = await createOrder({
        customerName: values.customerName.trim(),
        customerPhone: values.customerPhone.trim(),
        customerGovernorate: values.customerGovernorate,
        customerAddress: values.customerAddress.trim(),
        notes: values.notes.trim() || undefined,
        items: [orderItem()],
      })
      toast.success('Commande confirmee avec succes.')
      router.push(`/checkout/success?orderId=${orderId}`)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Une erreur est survenue. Veuillez reessayer.'))
    }
  }

  function onWhatsApp(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()

    if (!canSelect) {
      toast.error(remaining <= 0 ? 'Plus de stock pour ce produit.' : 'Choisissez la taille et la couleur.')
      return
    }

    window.location.href = whatsappMessageUrl(buildWhatsAppMessage(getValues()))
  }

  return (
    <div className="flex flex-col gap-5">
      {bundles.length === 0 ? (
        <ProductPrice
          price={selectedPrice.toFixed(3)}
          compareAtPrice={selectedCompareAt}
          size="lg"
          accentColor={accentColor}
        />
      ) : null}

      {bundles.length > 0 ? (
        <ProductBundleOptions
          bundles={bundles}
          selectedName={selectedBundle?.name ?? ''}
          onSelect={setSelectedBundleName}
          remainingUnits={remaining}
        />
      ) : null}

      {colors.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Couleur</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const selected = selectedColor === color.name
              return (
                <button
                  key={`${color.name}-${color.hex}`}
                  type="button"
                  onClick={() => setSelectedColor(color.name)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-light transition-all ${
                    selected
                      ? 'border-primary bg-primary/5 text-foreground'
                      : 'border-border text-muted-foreground hover:border-primary/40 hover:text-primary'
                  }`}
                >
                  <span
                    className="size-4 rounded-full border border-black/10"
                    style={{ backgroundColor: color.hex }}
                    aria-hidden
                  />
                  {color.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {sizeOptions.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {sizeOptions.some((size) => /\d+\s*cm/i.test(size.name))
              ? 'Dimensions'
              : 'Taille / format'}
          </p>
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map((size) => (
              <button
                key={size.name}
                type="button"
                onClick={() => setSelectedSize(size.name)}
                className={`rounded-full border px-4 py-2 text-sm font-light transition-all ${
                  selectedSize === size.name
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'border-border text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary'
                }`}
              >
                {size.name}
                {showSizePrices ? (
                  <span className={`ml-1.5 text-[11px] ${selectedSize === size.name ? 'opacity-80' : ''}`}>
                    {formatPriceTnd(size.price)} TND
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs font-medium text-muted-foreground">{stockLabel(remaining)}</p>

      <form
        onSubmit={handleSubmit(onCommander)}
        className="rounded-2xl border-2 border-primary/25 bg-card p-5 shadow-sm"
      >
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Commander ce produit</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Indiquez vos coordonnees pour confirmer la commande, ou envoyez-la directement sur WhatsApp.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="product-order-name" className={fieldLabelCls}>
              Nom complet <span className="text-primary">*</span>
            </label>
            <input
              id="product-order-name"
              type="text"
              autoComplete="name"
              placeholder="Ex: Fatma Ben Ali"
              aria-invalid={Boolean(errors.customerName)}
              aria-describedby={errors.customerName ? 'product-order-name-error' : undefined}
              className={errors.customerName ? fieldInputErrorCls : fieldInputCls}
              {...register('customerName')}
            />
            <FieldError id="product-order-name-error" message={errors.customerName?.message} />
          </div>

          <div>
            <label htmlFor="product-order-phone" className={fieldLabelCls}>
              Telephone <span className="text-primary">*</span>
            </label>
            <input
              id="product-order-phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="Ex: 22 123 456"
              aria-invalid={Boolean(errors.customerPhone)}
              aria-describedby={errors.customerPhone ? 'product-order-phone-error' : undefined}
              className={errors.customerPhone ? fieldInputErrorCls : fieldInputCls}
              {...register('customerPhone')}
            />
            <FieldError id="product-order-phone-error" message={errors.customerPhone?.message} />
          </div>

          <div>
            <label htmlFor="product-order-governorate" className={fieldLabelCls}>
              Gouvernorat <span className="text-primary">*</span>
            </label>
            <Controller
              control={control}
              name="customerGovernorate"
              render={({ field }) => (
                <StoreSelect
                  id="product-order-governorate"
                  value={field.value}
                  onChange={field.onChange}
                  options={GOVERNORATE_SELECT_OPTIONS}
                  placeholder="Choisir votre gouvernorat"
                  hasError={Boolean(errors.customerGovernorate)}
                />
              )}
            />
            <FieldError id="product-order-governorate-error" message={errors.customerGovernorate?.message} />
          </div>

          <div>
            <label htmlFor="product-order-address" className={fieldLabelCls}>
              Adresse <span className="text-primary">*</span>
            </label>
            <textarea
              id="product-order-address"
              rows={3}
              autoComplete="street-address"
              placeholder="Rue, ville, point de repere..."
              aria-invalid={Boolean(errors.customerAddress)}
              aria-describedby={errors.customerAddress ? 'product-order-address-error' : undefined}
              className={`${errors.customerAddress ? fieldInputErrorCls : fieldInputCls} resize-none`}
              {...register('customerAddress')}
            />
            <FieldError id="product-order-address-error" message={errors.customerAddress?.message} />
          </div>

          <div>
            <label htmlFor="product-order-note" className={fieldLabelCls}>
              Note <span className="font-medium text-muted-foreground">(optionnel)</span>
            </label>
            <textarea
              id="product-order-note"
              rows={2}
              placeholder="Couleur preferee, horaire, instructions..."
              aria-invalid={Boolean(errors.notes)}
              aria-describedby={errors.notes ? 'product-order-note-error' : undefined}
              className={`${errors.notes ? fieldInputErrorCls : fieldInputCls} resize-none`}
              {...register('notes')}
            />
            <FieldError id="product-order-note-error" message={errors.notes?.message} />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <button
            type="submit"
            disabled={!canSelect || isSubmitting}
            className="w-full rounded-full bg-primary py-4 text-base font-semibold tracking-wide text-primary-foreground shadow-lg shadow-primary/35 transition-all hover:brightness-110 hover:shadow-xl hover:shadow-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50"
          >
            <span className="inline-flex items-center justify-center gap-2">
              {isSubmitting ? 'Envoi en cours...' : 'Commander maintenant'}
              {!isSubmitting && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              )}
            </span>
          </button>

          <button
            type="button"
            onClick={onWhatsApp}
            disabled={!canSelect}
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-[#25D366] py-3.5 text-sm font-semibold text-white shadow-md shadow-[#25D366]/30 transition-all hover:bg-[#20bd5a] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 disabled:opacity-50"
          >
            <WhatsAppIcon />
            Commander sur WhatsApp
          </button>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!canSelect}
            className="w-full rounded-full border border-border py-3 text-sm font-medium text-muted-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary disabled:opacity-40"
          >
            {added ? 'Ajoute au panier' : remaining <= 0 ? 'Plus de stock' : 'Ajouter au panier'}
          </button>
        </div>
      </form>
    </div>
  )
}
