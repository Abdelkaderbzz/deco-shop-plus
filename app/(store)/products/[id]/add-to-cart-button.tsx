'use client'

import { createOrder, type CartItem } from '@/app/actions/orders'
import { useCart } from '@/components/cart-context'
import { ProductPrice } from '@/components/product-price'
import { ProductBundleOptions } from '@/components/product-bundle-options'
import { useToast } from '@/components/toast-provider'
import { getErrorMessage } from '@/lib/get-error-message'
import type { ProductColor } from '@/lib/product-colors'
import { lineStockUnits, type ProductBundle } from '@/lib/product-bundles'
import { formatPriceTnd, parsePrice } from '@/lib/product-price'
import { priceForSize, type ProductSize } from '@/lib/product-sizes'
import { SITE } from '@/lib/site'
import { whatsappMessageUrl } from '@/lib/social-links'
import { StoreSelect } from '@/components/store-select'
import { getGovernorateLabel, governorateSelectOptions } from '@/lib/tunisia-governorates'
import { productOrderSchemaFor } from '@/lib/i18n/storefront-schemas'
import { useI18n } from '@/lib/i18n/provider'
import type { ProductOrderFormValues } from '@/lib/validations'
import { useRouter } from 'next/navigation'
import { getCheckoutDraftId, markCheckoutCompleted, useAbandonedCheckout } from '@/lib/use-abandoned-checkout'
import { getDeliveryFee } from '@/app/actions/settings'
import { readMetaAttribution } from '@/lib/meta-cookies'
import { trackAddToCart, trackPurchase } from '@/lib/meta-pixel'
import { useRef, useState, type FormEvent } from 'react'
import type { ZodError } from 'zod'

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
  'w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-base text-foreground outline-none placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20'
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

function orderFieldErrors(error: ZodError): Partial<Record<keyof ProductOrderFormValues, string>> {
  const next: Partial<Record<keyof ProductOrderFormValues, string>> = {}
  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key === 'string' && !(key in next)) {
      next[key as keyof ProductOrderFormValues] = issue.message
    }
  }
  return next
}

function readProductOrderForm(form: HTMLFormElement): ProductOrderFormValues {
  const data = new FormData(form)
  return {
    customerName: String(data.get('customerName') ?? ''),
    customerPhone: String(data.get('customerPhone') ?? ''),
    customerGovernorate: String(data.get('customerGovernorate') ?? ''),
    customerAddress: String(data.get('customerAddress') ?? ''),
    notes: String(data.get('notes') ?? ''),
  }
}

function ProductOrderForm({
  canSelect,
  onOrder,
  onWhatsApp,
  abandonedItems,
}: {
  canSelect: boolean
  onOrder: (values: ProductOrderFormValues) => Promise<void>
  onWhatsApp: (values: ProductOrderFormValues) => void
  abandonedItems: CartItem[]
}) {
  const { dict, locale } = useI18n()
  const schema = productOrderSchemaFor(dict.validation)
  const formRef = useRef<HTMLFormElement>(null)
  const [errors, setErrors] = useState<Partial<Record<keyof ProductOrderFormValues, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [draft, setDraft] = useState<ProductOrderFormValues>({
    customerName: '',
    customerPhone: '',
    customerGovernorate: '',
    customerAddress: '',
    notes: '',
  })

  useAbandonedCheckout(
    {
      customerName: draft.customerName,
      customerPhone: draft.customerPhone,
      customerGovernorate: draft.customerGovernorate,
      customerAddress: draft.customerAddress,
      notes: draft.notes,
      items: abandonedItems,
    },
    { disabled: isSubmitting },
  )

  function syncDraft() {
    const form = formRef.current
    if (!form) return
    setDraft(readProductOrderForm(form))
  }

  function parsedValues() {
    const form = formRef.current
    if (!form) return null
    const result = schema.safeParse(readProductOrderForm(form))
    if (!result.success) {
      setErrors(orderFieldErrors(result.error))
      return null
    }
    setErrors({})
    return result.data
  }

  async function handleOrderSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = parsedValues()
    if (!values) return
    setIsSubmitting(true)
    try {
      await onOrder(values)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleOrderSubmit}
      onInput={syncDraft}
      onChange={syncDraft}
      noValidate
      className="rounded-2xl border-2 border-primary/25 bg-card p-5 shadow-sm"
    >
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{dict.product.orderThis}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {dict.product.orderHint}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="product-order-name" className={fieldLabelCls}>
            {dict.product.fullName} <span className="text-primary">*</span>
          </label>
          <input
            id="product-order-name"
            name="customerName"
            type="text"
            autoComplete="name"
            placeholder={dict.product.namePlaceholder}
            aria-invalid={Boolean(errors.customerName)}
            aria-describedby={errors.customerName ? 'product-order-name-error' : undefined}
            className={errors.customerName ? fieldInputErrorCls : fieldInputCls}
          />
          <FieldError id="product-order-name-error" message={errors.customerName} />
        </div>

        <div>
          <label htmlFor="product-order-phone" className={fieldLabelCls}>
            {dict.product.phone} <span className="text-primary">*</span>
          </label>
          <input
            id="product-order-phone"
            name="customerPhone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder={dict.product.phonePlaceholder}
            aria-invalid={Boolean(errors.customerPhone)}
            aria-describedby={errors.customerPhone ? 'product-order-phone-error' : undefined}
            className={errors.customerPhone ? fieldInputErrorCls : fieldInputCls}
          />
          <FieldError id="product-order-phone-error" message={errors.customerPhone} />
        </div>

        <div>
          <label htmlFor="product-order-governorate" className={fieldLabelCls}>
            {dict.product.governorate} <span className="text-primary">*</span>
          </label>
          <StoreSelect
            id="product-order-governorate"
            name="customerGovernorate"
            defaultValue=""
            options={governorateSelectOptions(locale)}
            placeholder={dict.product.governoratePlaceholder}
            hasError={Boolean(errors.customerGovernorate)}
          />
          <FieldError id="product-order-governorate-error" message={errors.customerGovernorate} />
        </div>

        <div>
          <label htmlFor="product-order-address" className={fieldLabelCls}>
            {dict.product.address} <span className="text-primary">*</span>
          </label>
          <textarea
            id="product-order-address"
            name="customerAddress"
            rows={3}
            autoComplete="street-address"
            placeholder={dict.product.addressPlaceholder}
            aria-invalid={Boolean(errors.customerAddress)}
            aria-describedby={errors.customerAddress ? 'product-order-address-error' : undefined}
            className={`${errors.customerAddress ? fieldInputErrorCls : fieldInputCls} resize-none`}
          />
          <FieldError id="product-order-address-error" message={errors.customerAddress} />
        </div>

        <div>
          <label htmlFor="product-order-note" className={fieldLabelCls}>
            {dict.product.note} <span className="font-medium text-muted-foreground">({dict.product.optional})</span>
          </label>
          <textarea
            id="product-order-note"
            name="notes"
            rows={2}
            placeholder={dict.product.notePlaceholder}
            aria-invalid={Boolean(errors.notes)}
            aria-describedby={errors.notes ? 'product-order-note-error' : undefined}
            className={`${errors.notes ? fieldInputErrorCls : fieldInputCls} resize-none`}
          />
          <FieldError id="product-order-note-error" message={errors.notes} />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <button
          type="submit"
          disabled={!canSelect || isSubmitting}
          className="w-full rounded-full bg-primary py-4 text-base font-semibold tracking-wide text-primary-foreground shadow-lg shadow-primary/35 transition-all hover:brightness-110 hover:shadow-xl hover:shadow-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50"
        >
          <span className="inline-flex items-center justify-center gap-2">
            {isSubmitting ? dict.product.sending : dict.product.orderNow}
            {!isSubmitting && (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden className="rtl:rotate-180">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            )}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            const values = parsedValues()
            if (values) onWhatsApp(values)
          }}
          disabled={!canSelect}
          className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-[#25D366] py-3.5 text-sm font-semibold text-white shadow-md shadow-[#25D366]/30 transition-all hover:bg-[#20bd5a] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 disabled:opacity-50"
        >
          <WhatsAppIcon />
          {dict.product.orderWhatsApp}
        </button>
      </div>
    </form>
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
  const { dict, locale } = useI18n()
  const router = useRouter()
  const toast = useToast()
  const fallbackPrice = parsePrice(product.price) ?? 0
  const sizeOptions = sizes.length > 0 ? sizes : [{ name: 'Unique', price: fallbackPrice }]
  const [selectedSize, setSelectedSize] = useState(sizeOptions[0]?.name ?? '')
  const [selectedColor, setSelectedColor] = useState(colors[0]?.name ?? '')
  const [selectedBundleName, setSelectedBundleName] = useState(bundles[0]?.name ?? '')
  const [added, setAdded] = useState(false)

  const selectedBundle = bundles.find((bundle) => bundle.name === selectedBundleName) ?? bundles[0]
  const selectedUnits = selectedBundle?.units ?? 1
  const sizePrice = priceForSize(sizeOptions, selectedSize, fallbackPrice)
  const selectedPrice = selectedBundle?.price ?? sizePrice
  const selectedCompareAt = selectedBundle
    ? selectedBundle.compareAtPrice != null
      ? selectedBundle.compareAtPrice.toFixed(3)
      : null
    : product.compareAtPrice
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
      color: selectedColor || '',
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
    trackAddToCart({
      productId: product.id,
      productName: product.name,
      price: selectedPrice,
      quantity: 1,
    })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 2000)
  }

  function buildWhatsAppMessage(values: ProductOrderFormValues) {
    const w = dict.whatsapp
    const lines = [
      w.hello(SITE.name),
      w.want,
      '',
      `${w.product} : ${product.name}`,
      `${w.brand} : ${product.brand}`,
      selectedSize
        ? `${/\d+\s*cm/i.test(selectedSize) ? w.dimensions : w.size} : ${selectedSize}`
        : null,
      selectedColor ? `${w.color} : ${selectedColor}` : null,
      selectedBundle ? `${w.pack} : ${selectedBundle.name} (${selectedBundle.units} ${w.pcs})` : null,
      `${w.price} : ${formatPriceTnd(selectedPrice)} TND`,
      '',
      values.customerName.trim() ? `${w.name} : ${values.customerName.trim()}` : null,
      values.customerPhone.trim() ? `${w.phone} : ${values.customerPhone.trim()}` : null,
      values.customerGovernorate
        ? `${w.governorate} : ${getGovernorateLabel(values.customerGovernorate, locale) ?? values.customerGovernorate}`
        : null,
      values.customerAddress.trim() ? `${w.address} : ${values.customerAddress.trim()}` : null,
    ].filter((line): line is string => line !== null)

    const note = values.notes.trim()
    if (note) lines.push(`${w.note} : ${note}`)

    return lines.join('\n')
  }

  async function onCommander(values: ProductOrderFormValues) {
    if (!canSelect) {
      toast.error(remaining <= 0 ? dict.product.noStockProduct : dict.product.chooseOptions)
      return
    }

    try {
      const orderId = await createOrder({
        checkoutDraftId: getCheckoutDraftId() || undefined,
        customerName: values.customerName.trim(),
        customerPhone: values.customerPhone.trim(),
        customerGovernorate: values.customerGovernorate,
        customerAddress: values.customerAddress.trim(),
        notes: values.notes.trim() || undefined,
        items: [orderItem()],
        meta: readMetaAttribution(),
      })
      markCheckoutCompleted()
      const deliveryFee = await getDeliveryFee()
      trackPurchase(
        orderId,
        [
          {
            productId: product.id,
            price: selectedPrice,
            quantity: 1,
          },
        ],
        selectedPrice + deliveryFee,
      )
      toast.success(dict.product.orderConfirmed)
      router.push(`/checkout/success?orderId=${orderId}`)
    } catch (error) {
      toast.error(getErrorMessage(error, dict.product.error))
    }
  }

  function onWhatsApp(values: ProductOrderFormValues) {
    if (!canSelect) {
      toast.error(remaining <= 0 ? dict.product.noStockProduct : dict.product.chooseOptions)
      return
    }

    window.location.href = whatsappMessageUrl(buildWhatsAppMessage(values))
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
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{dict.product.color}</p>
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
              ? dict.product.dimensions
              : dict.product.size}
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
                {size.name === 'Unique' ? dict.product.uniqueSize : size.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs font-medium text-muted-foreground">
        {remaining <= 0
          ? dict.product.outOfStock
          : remaining === 1
            ? dict.product.lastPiece
            : dict.product.inStock(remaining)}
      </p>

      <ProductOrderForm
        canSelect={canSelect}
        onOrder={onCommander}
        onWhatsApp={onWhatsApp}
        abandonedItems={[orderItem()]}
      />

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!canSelect}
        className="w-full rounded-full border border-border py-3 text-sm font-medium text-muted-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary disabled:opacity-40"
      >
        {added ? dict.product.added : remaining <= 0 ? dict.product.noStock : dict.product.addToCart}
      </button>
    </div>
  )
}
