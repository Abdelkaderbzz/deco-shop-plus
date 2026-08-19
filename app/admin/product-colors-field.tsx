'use client'

import { Plus, Trash2 } from 'lucide-react'
import {
  AdminButton,
  AdminFieldError,
  AdminIconButton,
  adminInputCls,
  adminLabelCls,
} from './admin-ui'
import type { ProductColor } from '@/lib/product-colors'
import { MAX_PRODUCT_COLORS } from '@/lib/product-colors'

const colorInputCls = 'size-10 shrink-0 cursor-pointer rounded-md border border-slate-300 bg-white p-1'

export function ProductColorsField({
  value,
  onChange,
  error,
}: {
  value: ProductColor[]
  onChange: (colors: ProductColor[]) => void
  error?: string
}) {
  function updateColor(index: number, next: ProductColor) {
    onChange(value.map((color, i) => (i === index ? next : color)))
  }

  function addColor() {
    if (value.length >= MAX_PRODUCT_COLORS) return
    onChange([...value, { name: '', hex: '#6b7280' }])
  }

  function removeColor(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className={`${adminLabelCls} mb-0`}>COULEURS</label>
        <AdminButton
          type="button"
          variant="outline"
          onClick={addColor}
          disabled={value.length >= MAX_PRODUCT_COLORS}
          className="inline-flex items-center gap-1 !px-2.5 !py-1.5 text-xs"
        >
          <Plus className="size-3.5" />
          Ajouter
        </AdminButton>
      </div>
      <p className="mb-3 text-xs text-slate-500">
        Laissez vide si le produit n a pas de choix de couleur. Exemple : Gris, Noir.
      </p>
      <div className="space-y-2">
        {value.map((color, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="color"
              className={colorInputCls}
              value={color.hex}
              onChange={(event) => updateColor(index, { ...color, hex: event.target.value })}
              aria-label={`Couleur ${index + 1}`}
            />
            <input
              type="text"
              className={adminInputCls}
              placeholder="Nom (Gris, Ivoire...)"
              value={color.name}
              onChange={(event) => updateColor(index, { ...color, name: event.target.value })}
            />
            <AdminIconButton
              type="button"
              label="Retirer la couleur"
              variant="danger"
              onClick={() => removeColor(index)}
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
