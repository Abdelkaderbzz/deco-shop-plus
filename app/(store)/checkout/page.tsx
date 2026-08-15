'use client'

import { getPickupBoutiques } from '@/app/actions/boutiques'
import { createOrder } from '@/app/actions/orders'
import { getDeliveryFee } from '@/app/actions/settings'
import { StoreSelect } from '@/components/store-select'
import { useCart } from '@/components/cart-context'
import { useToast } from '@/components/toast-provider'
import { boutiqueLabel, phoneHref, type PickupBoutique } from '@/lib/boutiques'
import { getErrorMessage } from '@/lib/get-error-message'
import { GOVERNORATE_SELECT_OPTIONS } from '@/lib/tunisia-governorates'
import { checkoutSchema, type CheckoutFormValues } from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

const storeLabelCls = 'mb-2 block text-sm font-semibold text-foreground'
const storeSectionCls = 'mb-5 text-sm font-semibold uppercase tracking-wide text-primary'
const storeInputCls =
  'w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/80 focus:border-primary focus:ring-2 focus:ring-primary/20'
const storeInputErrorCls =
  'w-full rounded-xl border-2 border-destructive bg-card px-4 py-3 text-base text-foreground outline-none focus:border-destructive focus:ring-2 focus:ring-destructive/20'

function modeCardCls(selected: boolean) {
  return `rounded-xl border-2 p-4 text-left transition-all ${
    selected
      ? 'border-primary bg-primary/15 ring-2 ring-primary/25'
      : 'border-border hover:border-primary/50'
  }`
}

function StoreFieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1.5 text-sm font-medium text-destructive">{message}</p>
}

export default function CheckoutPage() {
  const { items, total, removeItem, updateQuantity, clearCart } = useCart()
  const router = useRouter()
  const toast = useToast()
  const [deliveryFee, setDeliveryFee] = useState(7)
  const [boutiques, setBoutiques] = useState<PickupBoutique[]>([])

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      orderType: 'delivery',
      customerName: '',
      customerPhone: '',
      customerGovernorate: '',
      customerAddress: '',
      pickupBoutiqueId: null,
      notes: '',
    },
  })

  const orderType = watch('orderType')
  const pickupBoutiqueId = watch('pickupBoutiqueId')
  const isPickup = orderType === 'boutique'

  useEffect(() => {
    getDeliveryFee().then(setDeliveryFee).catch(() => setDeliveryFee(7))
    getPickupBoutiques().then(setBoutiques).catch(() => setBoutiques([]))
  }, [])

  const shippingCost = isPickup ? 0 : deliveryFee
  const grandTotal = total + shippingCost
  const selectedBoutique = boutiques.find((boutique) => boutique.id === pickupBoutiqueId)

  function chooseOrderType(next: CheckoutFormValues['orderType']) {
    setValue('orderType', next, { shouldValidate: false })
    if (next === 'boutique' && boutiques.length === 1) {
      setValue('pickupBoutiqueId', boutiques[0].id, { shouldValidate: false })
    }
  }

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
        orderType: values.orderType,
        pickupBoutiqueId: values.orderType === 'boutique' ? values.pickupBoutiqueId : null,
        notes: values.notes || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          productBrand: i.productBrand,
          size: i.size,
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
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
        <p className="text-sm font-light tracking-widest text-muted-foreground">VOTRE PANIER EST VIDE</p>
        <Link
          href="/products"
          className="rounded-full border border-primary bg-primary/5 px-8 py-3 text-xs font-light tracking-[0.3em] text-primary transition-all hover:bg-primary hover:text-primary-foreground"
        >
          VOIR LA BOUTIQUE
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Votre commande</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-foreground">Panier</h1>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.size}`}
              className="flex gap-4 rounded-2xl border border-border bg-card p-4"
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="h-20 w-16 object-cover shrink-0"
                />
              )}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="text-[10px] tracking-widest text-primary">{item.productBrand.toUpperCase()}</p>
                  <p className="text-sm font-light text-foreground">{item.productName}</p>
                  <p className="text-[11px] text-muted-foreground">{item.size}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 border border-border">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                      className="px-3 py-1 text-muted-foreground hover:text-primary transition-colors"
                    >
                      &minus;
                    </button>
                    <span className="min-w-5 text-center text-sm font-light text-foreground">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                      className="px-3 py-1 text-muted-foreground hover:text-primary transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm font-light text-foreground">
                    {(item.price * item.quantity).toFixed(3)} TND
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.productId, item.size)}
                className="self-start text-border hover:text-destructive transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}

          <div className="mt-6 rounded-2xl border-2 border-primary/20 bg-card p-6">
            <p className={storeSectionCls}>Mode de reception</p>

            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => chooseOrderType('delivery')} className={modeCardCls(!isPickup)}>
                <span className="text-sm font-semibold text-foreground">Livraison a domicile</span>
                <span className="mt-1 block text-sm font-medium text-primary">
                  {deliveryFee.toFixed(3)} TND
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  Partout en Tunisie, paiement a la livraison.
                </span>
              </button>

              {boutiques.length > 0 && (
                <button type="button" onClick={() => chooseOrderType('boutique')} className={modeCardCls(isPickup)}>
                  <span className="text-sm font-semibold text-foreground">Retrait en boutique</span>
                  <span className="mt-1 block text-sm font-medium text-primary">Gratuit</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Reservez en ligne, payez et recuperez sur place.
                  </span>
                </button>
              )}
            </div>

            {isPickup && (
              <div className="mt-5">
                <p className="mb-3 text-sm font-semibold text-foreground">
                  Boutique de retrait <span className="text-primary">*</span>
                </p>
                <div className="space-y-3">
                  {boutiques.map((boutique) => {
                    const selected = boutique.id === pickupBoutiqueId
                    return (
                      <label
                        key={boutique.id}
                        className={`flex cursor-pointer gap-3 rounded-xl border-2 p-4 transition-all ${
                          selected
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/25'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="pickupBoutiqueId"
                          value={boutique.id}
                          checked={selected}
                          onChange={() =>
                            setValue('pickupBoutiqueId', boutique.id, { shouldValidate: true })
                          }
                          className="mt-1 shrink-0 accent-primary"
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-foreground">
                            {boutique.name}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {boutiqueLabel(boutique)}
                            {boutique.address ? ` · ${boutique.address}` : ''}
                          </span>
                          {boutique.phone && (
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              +216 {boutique.phone}
                            </span>
                          )}
                        </span>
                      </label>
                    )
                  })}
                </div>
                <StoreFieldError message={errors.pickupBoutiqueId?.message} />
                <p className="mt-3 text-xs text-muted-foreground">
                  Nous vous appelons des que votre commande est prete a etre retiree.
                </p>
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
          <input type="hidden" {...register('orderType')} />

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
              {isPickup ? (
                selectedBoutique && (
                  <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      Retrait en boutique
                    </p>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      {selectedBoutique.name}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {boutiqueLabel(selectedBoutique)}
                      {selectedBoutique.address ? ` · ${selectedBoutique.address}` : ''}
                    </p>
                    {selectedBoutique.phone && (
                      <a
                        href={phoneHref(selectedBoutique.phone)}
                        className="mt-1 inline-block text-sm text-muted-foreground transition-colors hover:text-primary hover:underline"
                      >
                        +216 {selectedBoutique.phone}
                      </a>
                    )}
                  </div>
                )
              ) : (
                <>
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
                </>
              )}
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
              <span className="font-medium">{total.toFixed(3)} TND</span>
            </div>
            <div className="flex justify-between text-base text-foreground">
              <span>{isPickup ? 'Retrait en boutique' : 'Livraison'}</span>
              <span className="font-medium">
                {isPickup ? 'Gratuit' : `${deliveryFee.toFixed(3)} TND`}
              </span>
            </div>
            <div className="h-px bg-primary/20" />
            <div className="flex justify-between items-center text-foreground">
              <span className="text-base font-semibold">Total a payer</span>
              <span className="text-2xl font-semibold tabular-nums text-primary">
                {grandTotal.toFixed(3)} TND
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-primary py-4 text-sm font-semibold tracking-wide text-primary-foreground shadow-md shadow-primary/30 transition-all hover:opacity-95 disabled:opacity-60"
          >
            {isSubmitting
              ? 'Envoi en cours...'
              : isPickup
                ? 'Reserver et retirer en boutique'
                : 'Confirmer la commande'}
          </button>
        </form>
      </div>
    </div>
  )
}
