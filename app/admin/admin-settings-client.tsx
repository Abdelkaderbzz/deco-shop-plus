'use client'

import { updateDeliveryFee } from '@/app/actions/settings'
import { useToast } from '@/components/toast-provider'
import { getErrorMessage } from '@/lib/get-error-message'
import { deliveryFeeSchema, type DeliveryFeeFormValues } from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { AdminButton, AdminCard, AdminFieldError, adminInputWithError, adminLabelCls } from './admin-ui'

export function AdminSettingsClient({
  initialSettings,
}: {
  initialSettings: { deliveryFee: string; updatedAt: Date }
}) {
  const toast = useToast()
  const [savedFee, setSavedFee] = useState(initialSettings.deliveryFee)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeliveryFeeFormValues>({
    resolver: zodResolver(deliveryFeeSchema),
    defaultValues: { deliveryFee: initialSettings.deliveryFee },
  })

  function onSubmit(values: DeliveryFeeFormValues) {
    startTransition(async () => {
      try {
        await updateDeliveryFee(values.deliveryFee)
        setSavedFee(values.deliveryFee)
        toast.success('Tarif de livraison mis a jour.')
      } catch (error) {
        toast.error(getErrorMessage(error, 'Impossible de mettre a jour le tarif.'))
      }
    })
  }

  return (
    <div className="max-w-xl">
      <AdminCard title="Tarif de livraison">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className={adminLabelCls}>Frais de livraison (TND)</label>
            <input
              type="number"
              step="0.001"
              min="0"
              className={adminInputWithError(!!errors.deliveryFee)}
              {...register('deliveryFee')}
            />
            <AdminFieldError message={errors.deliveryFee?.message} />
            <p className="mt-2 text-sm text-slate-500">
              Ce montant est ajoute automatiquement aux commandes avec livraison a domicile.
              Le retrait en boutique reste gratuit.
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm font-medium text-slate-600">Tarif actuel en boutique</p>
            <p className="mt-1 text-2xl font-bold text-amber-900">
              {parseFloat(savedFee).toFixed(3)} TND
            </p>
          </div>

          <AdminButton type="submit" disabled={isPending}>
            {isPending ? 'Enregistrement...' : 'Enregistrer'}
          </AdminButton>
        </form>
      </AdminCard>
    </div>
  )
}
