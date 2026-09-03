'use client'

import { createOrder } from '@/app/actions/orders'
import { getDeliveryFee } from '@/app/actions/settings'
import { StoreSelect } from '@/components/store-select'
import { cartLineKey, useCart } from '@/components/cart-context'
import { ProductTrustBox } from '@/components/product-trust-box'
import { Reveal } from '@/components/reveal'
import { useToast } from '@/components/toast-provider'
import { getErrorMessage } from '@/lib/get-error-message'
import { formatPriceTnd } from '@/lib/product-price'
import { checkoutSchemaFor } from '@/lib/i18n/storefront-schemas'
import { useI18n } from '@/lib/i18n/provider'
import { localizeProductName } from '@/lib/i18n/products'
import { governorateSelectOptions } from '@/lib/tunisia-governorates'
import type { CheckoutFormValues } from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { MetaPixelInitiateCheckout } from '@/components/meta-pixel-initiate-checkout'
import { readMetaAttribution } from '@/lib/meta-cookies'
import { trackPurchase } from '@/lib/meta-pixel'
import { getCheckoutDraftId, markCheckoutCompleted, useAbandonedCheckout } from '@/lib/use-abandoned-checkout'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

const storeLabelCls = 'mb-2 block text-sm font-semibold text-foreground'
const storeSectionCls = 'mb-5 text-sm font-semibold uppercase tracking-wide text-primary'
const storeInputCls =
  'w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/80 focus:border-primary focus:ring-2 focus:ring-primary/20'
const storeInputErrorCls =
  'w-full rounded-xl border-2 border-destructive bg-card px-4 py-3 text-base text-foreground outline-none focus:border-destructive focus:ring-2 focus:ring-destructive/20'

function StoreFieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1.5 text-sm font-medium text-destructive">{message}</p>
}

export default function CheckoutPage() {
  const { items, total, removeItem, updateQuantity, clearCart } = useCart()
  const { dict, locale } = useI18n()
  const router = useRouter()
  const toast = useToast()
  const [deliveryFee, setDeliveryFee] = useState(7)
  const [deliveryFeeReady, setDeliveryFeeReady] = useState(false)
  const schema = checkoutSchemaFor(dict.validation)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      customerGovernorate: '',
      customerAddress: '',
      notes: '',
    },
  })

  const customerName = watch('customerName')
  const customerPhone = watch('customerPhone')
  const customerGovernorate = watch('customerGovernorate')
  const customerAddress = watch('customerAddress')
  const notes = watch('notes')

  const abandonedItems = useMemo(
    () =>
      items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        productBrand: item.productBrand,
        size: item.size,
        color: item.color || '',
        bundle: item.bundle || '',
        bundleUnits: item.bundleUnits || 1,
        quantity: item.quantity,
        price: item.price,
      })),
    [items],
  )

  useAbandonedCheckout(
    {
      customerName: customerName ?? '',
      customerPhone: customerPhone ?? '',
      customerGovernorate,
      customerAddress,
      notes,
      items: abandonedItems,
    },
    { disabled: isSubmitting || items.length === 0 },
  )

  useEffect(() => {
    getDeliveryFee()
      .then((fee) => setDeliveryFee(fee))
      .catch(() => setDeliveryFee(7))
      .finally(() => setDeliveryFeeReady(true))
  }, [])

  const grandTotal = total + deliveryFee

  async function onSubmit(values: CheckoutFormValues) {
    if (items.length === 0) {
      toast.error(dict.checkout.emptyError)
      return
    }

    try {
      const orderId = await createOrder({
        checkoutDraftId: getCheckoutDraftId() || undefined,
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        customerGovernorate: values.customerGovernorate || undefined,
        customerAddress: values.customerAddress || undefined,
        notes: values.notes || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          productBrand: i.productBrand,
          size: i.size,
          color: i.color || '',
          bundle: i.bundle || '',
          bundleUnits: i.bundleUnits || 1,
          quantity: i.quantity,
          price: i.price,
        })),
        meta: readMetaAttribution(),
      })
      markCheckoutCompleted()
      trackPurchase(
        orderId,
        items.map((item) => ({
          productId: item.productId,
          price: item.price,
          quantity: item.quantity,
        })),
        grandTotal,
      )
      clearCart()
      toast.success(dict.product.orderConfirmed)
      router.push(`/checkout/success?orderId=${orderId}`)
    } catch (error) {
      toast.error(getErrorMessage(error, dict.product.error))
    }
  }

  if (items.length === 0) {
    return (
      <Reveal className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <p className="text-sm font-light tracking-widest text-muted-foreground">{dict.checkout.empty}</p>
        <Link
          href="/products"
          className="rounded-full border border-primary bg-primary/5 px-8 py-3 text-xs font-light tracking-[0.3em] text-primary transition-all hover:bg-primary hover:text-primary-foreground"
        >
          {dict.checkout.seeShop}
        </Link>
      </Reveal>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-2 py-8 sm:px-3">
      <MetaPixelInitiateCheckout
        items={items}
        value={grandTotal}
        ready={deliveryFeeReady}
      />
      <Reveal className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">{dict.checkout.yourOrder}</p>
        <h1 className="mt-2 font-serif text-2xl font-semibold text-foreground">{dict.checkout.title}</h1>
      </Reveal>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-4">
          {items.map((item) => (
            <div
              key={cartLineKey(item)}
              className="flex gap-4 rounded-2xl border border-border bg-card p-4"
            >
              {item.imageUrl && (
                <Image
                  src={item.imageUrl}
                  alt={localizeProductName(item.productName, locale)}
                  width={80}
                  height={100}
                  sizes="80px"
                  className="h-20 w-16 shrink-0 object-cover"
                />
              )}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="text-[10px] tracking-widest text-primary">{item.productBrand.toUpperCase()}</p>
                  <p className="text-sm font-light text-foreground">
                    {localizeProductName(item.productName, locale)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {[item.bundle, item.size, item.color].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 border border-border">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item, item.quantity - 1)}
                      className="px-3 py-1 text-muted-foreground hover:text-primary transition-colors"
                    >
                      &minus;
                    </button>
                    <span className="min-w-5 text-center text-sm font-light text-foreground">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item, item.quantity + 1)}
                      className="px-3 py-1 text-muted-foreground hover:text-primary transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm font-light text-foreground">
                    {formatPriceTnd(item.price * item.quantity)} TND
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item)}
                className="self-start text-border hover:text-destructive transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}

          <div className="mt-6 rounded-2xl border-2 border-primary/20 bg-card p-6">
            <p className={storeSectionCls}>{dict.checkout.delivery}</p>
            <p className="text-sm font-semibold text-foreground">{dict.checkout.homeDelivery}</p>
            <p className="mt-1 text-sm font-medium text-primary">
              {formatPriceTnd(deliveryFee)} TND
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {dict.checkout.cod}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border-2 border-primary/20 bg-card p-6">
            <p className={storeSectionCls}>{dict.checkout.details}</p>
            <div className="space-y-5">
              <div>
                <label className={storeLabelCls}>
                  {dict.product.fullName} <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  placeholder={dict.product.namePlaceholder}
                  className={errors.customerName ? storeInputErrorCls : storeInputCls}
                  {...register('customerName')}
                />
                <StoreFieldError message={errors.customerName?.message} />
              </div>
              <div>
                <label className={storeLabelCls}>
                  {dict.checkout.phone} <span className="text-primary">*</span>
                </label>
                <input
                  type="tel"
                  placeholder={dict.product.phonePlaceholder}
                  className={errors.customerPhone ? storeInputErrorCls : storeInputCls}
                  {...register('customerPhone')}
                />
                <StoreFieldError message={errors.customerPhone?.message} />
              </div>
              <div>
                <label className={storeLabelCls}>
                  {dict.product.governorate} <span className="text-primary">*</span>
                </label>
                <Controller
                  control={control}
                  name="customerGovernorate"
                  render={({ field }) => (
                    <StoreSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={governorateSelectOptions(locale)}
                      placeholder={dict.product.governoratePlaceholder}
                      hasError={!!errors.customerGovernorate}
                    />
                  )}
                />
                <StoreFieldError message={errors.customerGovernorate?.message} />
              </div>
              <div>
                <label className={storeLabelCls}>
                  {dict.checkout.deliveryAddress} <span className="text-primary">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder={dict.product.addressPlaceholder}
                  className={`${errors.customerAddress ? storeInputErrorCls : storeInputCls} resize-none`}
                  {...register('customerAddress')}
                />
                <StoreFieldError message={errors.customerAddress?.message} />
              </div>
              <div>
                <label className={storeLabelCls}>{dict.checkout.notes}</label>
                <textarea
                  rows={2}
                  placeholder={dict.checkout.notesPlaceholder}
                  className={`${errors.notes ? storeInputErrorCls : storeInputCls} resize-none`}
                  {...register('notes')}
                />
                <StoreFieldError message={errors.notes?.message} />
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border-2 border-primary/20 bg-secondary/40 p-6">
            <p className={storeSectionCls}>{dict.checkout.summary}</p>
            <div className="flex justify-between text-base text-foreground">
              <span>{dict.checkout.subtotal}</span>
              <span className="font-medium">{formatPriceTnd(total)} TND</span>
            </div>
            <div className="flex justify-between text-base text-foreground">
              <span>{dict.checkout.delivery}</span>
              <span className="font-medium">{formatPriceTnd(deliveryFee)} TND</span>
            </div>
            <div className="h-px bg-primary/20" />
            <div className="flex justify-between items-center text-foreground">
              <span className="text-base font-semibold">{dict.checkout.total}</span>
              <span className="text-2xl font-semibold tabular-nums text-primary">
                {formatPriceTnd(grandTotal)} TND
              </span>
            </div>
          </div>

          <ProductTrustBox />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-primary py-4 text-sm font-semibold tracking-wide text-primary-foreground shadow-md shadow-primary/30 transition-all hover:opacity-95 disabled:opacity-60"
          >
            {isSubmitting ? dict.product.sending : dict.checkout.confirm}
          </button>
        </form>
      </div>
    </div>
  )
}
