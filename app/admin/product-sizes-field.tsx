'use client'

import { Plus, Trash2 } from 'lucide-react'
import {
  AdminButton,
  AdminFieldError,
  AdminIconButton,
  adminInputCls,
  adminLabelCls,
} from './admin-ui'
import { MAX_PRODUCT_SIZES, type ProductSizeInput } from '@/lib/product-sizes'

export function ProductSizesField({
  value,
  onChange,
  defaultPrice,
  error,
}: {
  value: ProductSizeInput[]
  onChange: (sizes: ProductSizeInput[]) => void
  defaultPrice?: string
  error?: string
}) {
  function updateSize(index: number, next: ProductSizeInput) {
    onChange(value.map((size, i) => (i === index ? next : size)))
  }

  function addSize() {
    if (value.length >= MAX_PRODUCT_SIZES) return
    onChange([...value, { name: '', price: defaultPrice?.trim() || '' }])
  }

  function removeSize(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className={`${adminLabelCls} mb-0`}>TAILLES ET PRIX</label>
        <AdminButton
          type="button"
          variant="outline"
          onClick={addSize}
          disabled={value.length >= MAX_PRODUCT_SIZES}
          className="inline-flex items-center gap-1 !px-2.5 !py-1.5 text-xs"
        >
          <Plus className="size-3.5" />
          Ajouter
        </AdminButton>
      </div>
      <p className="mb-3 text-xs text-slate-500">
        Ajoutez une ligne par taille, avec son prix. Laissez vide pour un seul prix unique.
      </p>
      <div className="space-y-2">
        {value.map((size, index) => (
          <div key={index} className="grid grid-cols-[1fr_8rem_auto] items-center gap-2">
            <input
              type="text"
              className={adminInputCls}
              placeholder="Taille (45x45, Unique...)"
              value={size.name}
              onChange={(event) => updateSize(index, { ...size, name: event.target.value })}
            />
            <input
              type="number"
              min={0}
              step="0.001"
              className={adminInputCls}
              placeholder="Prix TND"
              value={size.price}
              onChange={(event) => updateSize(index, { ...size, price: event.target.value })}
              aria-label={`Prix taille ${index + 1}`}
            />
            <AdminIconButton
              type="button"
              label="Retirer la taille"
              variant="danger"
              onClick={() => removeSize(index)}
            >
              <Trash2 className="size-4" />
            </AdminIconButton>
          </div>
        ))}
      </div>
      <AdminFieldError message={error} />
    </div>
  )
}
