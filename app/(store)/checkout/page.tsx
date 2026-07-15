'use client'

import { createOrder } from '@/app/actions/orders'
import { getDeliveryFee } from '@/app/actions/settings'
import { StoreSelect } from '@/components/store-select'
import { useCart } from '@/components/cart-context'
import { useToast } from '@/components/toast-provider'
import { getErrorMessage } from '@/lib/get-error-message'
import { GOVERNORATE_SELECT_OPTIONS } from '@/lib/tunisia-governorates'
import { checkoutSchema, type CheckoutFormValues } from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

const storeInputCls =
  'w-full rounded-xl border border-border bg-input px-3 py-2.5 text-sm font-light text-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10'
const storeInputErrorCls =
  'w-full rounded-xl border border-destructive bg-input px-3 py-2.5 text-sm font-light text-foreground outline-none focus:border-destructive'

function StoreFieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-destructive">{message}</p>
}

export default function CheckoutPage() {
  const { items, total, removeItem, updateQuantity, clearCart } = useCart()
  const router = useRouter()
  const toast = useToast()
  const [deliveryFee, setDeliveryFee] = useState(7)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      orderType: 'delivery',
      customerName: '',
      customerPhone: '',
      customerGovernorate: '',
      customerAddress: '',
      notes: '',
    },
  })

  const orderType = watch('orderType')

  useEffect(() => {
    getDeliveryFee().then(setDeliveryFee).catch(() => setDeliveryFee(7))
  }, [])

  const appliedDeliveryFee = orderType === 'delivery' ? deliveryFee : 0
  const grandTotal = total + appliedDeliveryFee

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
        <p className="text-[10px] font-light tracking-[0.4em] text-primary">VOTRE COMMANDE</p>
        <h1 className="mt-2 font-serif text-3xl font-light tracking-widest text-foreground">PANIER</h1>
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
                  className="h-20 w-16 object-cover flex-shrink-0"
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
                    <span className="min-w-[20px] text-center text-sm font-light text-foreground">
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

          <div className="mt-6 rounded-2xl border border-border bg-card p-6">
            <p className="mb-4 text-[10px] font-light tracking-[0.3em] text-muted-foreground">MODE DE RECEPTION</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue('orderType', 'delivery', { shouldValidate: true })}
                className={`rounded-xl border p-4 text-left transition-all ${
                  orderType === 'delivery'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <p className="text-xs font-light tracking-widest text-foreground">LIVRAISON</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{deliveryFee.toFixed(3)} TND</p>
              </button>
              <button
                type="button"
                onClick={() => setValue('orderType', 'boutique', { shouldValidate: true })}
                className={`rounded-xl border p-4 text-left transition-all ${
                  orderType === 'boutique'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <p className="text-xs font-light tracking-widest text-foreground">RETRAIT BOUTIQUE</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Gratuit</p>
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
          <input type="hidden" {...register('orderType')} />

          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="mb-5 text-[10px] font-light tracking-[0.3em] text-muted-foreground">VOS COORDONNEES</p>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-[10px] font-light tracking-widest text-muted-foreground">
                  NOM COMPLET *
                </label>
                <input
                  type="text"
                  className={errors.customerName ? storeInputErrorCls : storeInputCls}
                  {...register('customerName')}
                />
                <StoreFieldError message={errors.customerName?.message} />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-light tracking-widest text-muted-foreground">
                  TELEPHONE *
                </label>
                <input
                  type="tel"
                  placeholder="+216 XX XXX XXX"
                  className={errors.customerPhone ? storeInputErrorCls : storeInputCls}
                  {...register('customerPhone')}
                />
                <StoreFieldError message={errors.customerPhone?.message} />
              </div>
              {orderType === 'delivery' && (
                <>
                  <div>
                    <label className="mb-1 block text-[10px] font-light tracking-widest text-muted-foreground">
                      GOUVERNORAT *
                    </label>
                    <Controller
                      control={control}
                      name="customerGovernorate"
                      render={({ field }) => (
                        <StoreSelect
                          value={field.value}
                          onChange={field.onChange}
                          options={GOVERNORATE_SELECT_OPTIONS}
                          placeholder="Choisir un gouvernorat"
                          hasError={!!errors.customerGovernorate}
                        />
                      )}
                    />
                    <StoreFieldError message={errors.customerGovernorate?.message} />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-light tracking-widest text-muted-foreground">
                      ADRESSE DE LIVRAISON *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Rue, ville, code postal..."
                      className={`${errors.customerAddress ? storeInputErrorCls : storeInputCls} resize-none`}
                      {...register('customerAddress')}
                    />
                    <StoreFieldError message={errors.customerAddress?.message} />
                  </div>
                </>
              )}
              <div>
                <label className="mb-1 block text-[10px] font-light tracking-widest text-muted-foreground">
                  NOTES (OPTIONNEL)
                </label>
                <textarea
                  rows={2}
                  className={`${errors.notes ? storeInputErrorCls : storeInputCls} resize-none`}
                  {...register('notes')}
                />
                <StoreFieldError message={errors.notes?.message} />
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-border bg-card p-6">
            <p className="text-[10px] font-light tracking-[0.3em] text-muted-foreground">RECAPITULATIF</p>
            <div className="flex justify-between text-sm font-light text-muted-foreground">
              <span>Sous-total</span>
              <span>{total.toFixed(3)} TND</span>
            </div>
            <div className="flex justify-between text-sm font-light text-muted-foreground">
              <span>Livraison</span>
              <span>
                {appliedDeliveryFee === 0 ? 'Gratuit' : `${appliedDeliveryFee.toFixed(3)} TND`}
              </span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between font-light text-foreground">
              <span className="text-sm tracking-widest">TOTAL</span>
              <span className="font-serif text-lg">{grandTotal.toFixed(3)} TND</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-primary py-4 text-xs font-light tracking-[0.3em] text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? 'TRAITEMENT...' : 'CONFIRMER LA COMMANDE'}
          </button>
        </form>
      </div>
    </div>
  )
}
