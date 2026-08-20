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
import { GOVERNORATE_SELECT_OPTIONS } from '@/lib/tunisia-governorates'
import { checkoutSchema, type CheckoutFormValues } from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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
  const router = useRouter()
  const toast = useToast()
  const [deliveryFee, setDeliveryFee] = useState(7)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      customerGovernorate: '',
      customerAddress: '',
      notes: '',
    },
  })

  useEffect(() => {
    getDeliveryFee().then(setDeliveryFee).catch(() => setDeliveryFee(7))
  }, [])

  const grandTotal = total + deliveryFee

  async function onSubmit(values: CheckoutFormValues) {
    if (items.length === 0) {
      toast.error('Votre panier est vide.')
      return
    }

    try {
      const orderId = await createOrder({
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
          quantity: i.quantity,
          price: i.price,
        })),
      })
      clearCart()
      toast.success('Commande confirmee avec succes.')
      router.push(`/checkout/success?orderId=${orderId}`)
    } catch (error) {
      toast.error(getErrorMessage(error, 'Une erreur est survenue. Veuillez reessayer.'))
    }
  }

  if (items.length === 0) {
    return (
      <Reveal className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <p className="text-sm font-light tracking-widest text-muted-foreground">VOTRE PANIER EST VIDE</p>
        <Link
          href="/products"
          className="rounded-full border border-primary bg-primary/5 px-8 py-3 text-xs font-light tracking-[0.3em] text-primary transition-all hover:bg-primary hover:text-primary-foreground"
        >
          VOIR LA BOUTIQUE
        </Link>
      </Reveal>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-2 py-8 sm:px-3">
      <Reveal className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Votre commande</p>
        <h1 className="mt-2 font-serif text-2xl font-semibold text-foreground">Panier</h1>
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
                  alt={item.productName}
                  width={80}
                  height={100}
                  sizes="80px"
                  className="h-20 w-16 shrink-0 object-cover"
                />
              )}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="text-[10px] tracking-widest text-primary">{item.productBrand.toUpperCase()}</p>
                  <p className="text-sm font-light text-foreground">{item.productName}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {[item.size, item.color].filter(Boolean).join(' · ')}
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
            <p className={storeSectionCls}>Livraison</p>
            <p className="text-sm font-semibold text-foreground">Livraison a domicile</p>
            <p className="mt-1 text-sm font-medium text-primary">
              {formatPriceTnd(deliveryFee)} TND
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Partout en Tunisie, paiement a la livraison.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border-2 border-primary/20 bg-card p-6">
            <p className={storeSectionCls}>Vos coordonnees</p>
            <div className="space-y-5">
              <div>
                <label className={storeLabelCls}>
                  Nom complet <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Fatma Ben Ali"
                  className={errors.customerName ? storeInputErrorCls : storeInputCls}
                  {...register('customerName')}
                />
                <StoreFieldError message={errors.customerName?.message} />
              </div>
              <div>
                <label className={storeLabelCls}>
                  Numero de telephone <span className="text-primary">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="Ex: 22 123 456"
                  className={errors.customerPhone ? storeInputErrorCls : storeInputCls}
                  {...register('customerPhone')}
                />
                <StoreFieldError message={errors.customerPhone?.message} />
              </div>
              <div>
                <label className={storeLabelCls}>
                  Gouvernorat <span className="text-primary">*</span>
                </label>
                <Controller
                  control={control}
                  name="customerGovernorate"
                  render={({ field }) => (
                    <StoreSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={GOVERNORATE_SELECT_OPTIONS}
                      placeholder="Choisir votre gouvernorat"
                      hasError={!!errors.customerGovernorate}
                    />
                  )}
                />
                <StoreFieldError message={errors.customerGovernorate?.message} />
              </div>
              <div>
                <label className={storeLabelCls}>
                  Adresse de livraison <span className="text-primary">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Rue, ville, point de repere..."
                  className={`${errors.customerAddress ? storeInputErrorCls : storeInputCls} resize-none`}
                  {...register('customerAddress')}
                />
                <StoreFieldError message={errors.customerAddress?.message} />
              </div>
              <div>
                <label className={storeLabelCls}>Notes (optionnel)</label>
                <textarea
                  rows={2}
                  placeholder="Instructions supplementaires..."
                  className={`${errors.notes ? storeInputErrorCls : storeInputCls} resize-none`}
                  {...register('notes')}
                />
                <StoreFieldError message={errors.notes?.message} />
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border-2 border-primary/20 bg-secondary/40 p-6">
            <p className={storeSectionCls}>Recapitulatif</p>
            <div className="flex justify-between text-base text-foreground">
              <span>Sous-total</span>
              <span className="font-medium">{formatPriceTnd(total)} TND</span>
            </div>
            <div className="flex justify-between text-base text-foreground">
              <span>Livraison</span>
              <span className="font-medium">{formatPriceTnd(deliveryFee)} TND</span>
            </div>
            <div className="h-px bg-primary/20" />
            <div className="flex justify-between items-center text-foreground">
              <span className="text-base font-semibold">Total a payer</span>
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
            {isSubmitting ? 'Envoi en cours...' : 'Confirmer la commande'}
          </button>
        </form>
      </div>
    </div>
  )
}
