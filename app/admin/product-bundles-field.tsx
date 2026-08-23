'use client'

import { Plus, Trash2 } from 'lucide-react'
import {
  AdminButton,
  AdminFieldError,
  AdminIconButton,
  adminInputCls,
  adminLabelCls,
} from './admin-ui'
import { MAX_PRODUCT_BUNDLES, type ProductBundleInput } from '@/lib/product-bundles'

export function ProductBundlesField({
  value,
  onChange,
  defaultPrice,
  error,
}: {
  value: ProductBundleInput[]
  onChange: (bundles: ProductBundleInput[]) => void
  defaultPrice?: string
  error?: string
}) {
  function updateBundle(index: number, next: ProductBundleInput) {
    onChange(
      value.map((bundle, i) => {
        if (i === index) return next
        if (next.popular && bundle.popular) return { ...bundle, popular: false }
        return bundle
      }),
    )
  }

  function addBundle() {
    if (value.length >= MAX_PRODUCT_BUNDLES) return
    const nextIndex = value.length + 1
    onChange([
      ...value,
      {
        name: nextIndex === 1 ? '1 piece' : `Pack ${nextIndex}`,
        units: String(nextIndex),
        price: defaultPrice?.trim() || '',
        compareAtPrice: '',
        popular: false,
      },
    ])
  }

  function removeBundle(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className={`${adminLabelCls} mb-0`}>PACKS / LOTS</label>
        <AdminButton
          type="button"
          variant="outline"
          onClick={addBundle}
          disabled={value.length >= MAX_PRODUCT_BUNDLES}
          className="inline-flex items-center gap-1 !px-2.5 !py-1.5 text-xs"
        >
          <Plus className="size-3.5" />
          Ajouter
        </AdminButton>
      </div>
      <p className="mb-3 text-xs text-slate-500">
        Laissez vide pour vendre a l unite. Sinon, chaque ligne est un pack : nom, nombre de pieces, prix du pack, ancien prix (barre), et badge « le plus populaire ».
      </p>
      <div className="space-y-3">
        {value.map((bundle, index) => (
          <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="grid grid-cols-[1fr_5.5rem_auto] items-center gap-2">
              <input
                type="text"
                className={adminInputCls}
                placeholder="Nom (Pack 2 coussins...)"
                value={bundle.name}
                onChange={(event) => updateBundle(index, { ...bundle, name: event.target.value })}
              />
              <input
                type="number"
                min={1}
                max={99}
                step={1}
                className={adminInputCls}
                placeholder="Pcs"
                value={bundle.units}
                onChange={(event) => updateBundle(index, { ...bundle, units: event.target.value })}
                aria-label={`Pieces pack ${index + 1}`}
              />
              <AdminIconButton
                type="button"
                label="Retirer le pack"
                variant="danger"
                onClick={() => removeBundle(index)}
              >
                <Trash2 className="size-4" />
              </AdminIconButton>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input
                type="number"
                min={0}
                step="0.001"
                className={adminInputCls}
                placeholder="Prix pack TND"
                value={bundle.price}
                onChange={(event) => updateBundle(index, { ...bundle, price: event.target.value })}
                aria-label={`Prix pack ${index + 1}`}
              />
              <input
                type="number"
                min={0}
                step="0.001"
                className={adminInputCls}
                placeholder="Ancien prix (optionnel)"
                value={bundle.compareAtPrice}
                onChange={(event) =>
                  updateBundle(index, { ...bundle, compareAtPrice: event.target.value })
                }
                aria-label={`Ancien prix pack ${index + 1}`}
              />
            </div>
            <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-600">
              <input
                type="checkbox"
                className="accent-teal-700"
                checked={bundle.popular}
                onChange={(event) =>
                  updateBundle(index, { ...bundle, popular: event.target.checked })
                }
              />
              Le plus populaire
            </label>
          </div>
        ))}
      </div>
      <AdminFieldError message={error} />
    </div>
  )
}
