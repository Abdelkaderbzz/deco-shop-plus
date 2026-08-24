'use client'

import type { CartItem } from '@/app/actions/orders'
import { parseProductColors } from '@/lib/product-colors'
import { lineStockUnits, parseProductBundles } from '@/lib/product-bundles'
import {
  hasVariableSizePrices,
  parseProductSizes,
  priceForSize,
  type ProductSize,
} from '@/lib/product-sizes'
import { Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AdminSelect } from '../admin-select'
import {
  AdminButton,
  AdminFieldError,
  AdminIconButton,
  adminInputCls,
  adminLabelCls,
} from '../admin-ui'
import type { CreateOrderProduct } from './admin-order-create-modal'

export type OrderLineDraft = CartItem & { key: string }

function sizesForProduct(product: CreateOrderProduct): ProductSize[] {
  const fallback = parseFloat(product.price) || 0
  const sizes = parseProductSizes(product.sizes, fallback)
  return sizes.length > 0 ? sizes : [{ name: 'Standard', price: fallback }]
}

function availableStock(product: CreateOrderProduct, reservedStock: Record<number, number>) {
  return Math.max(0, product.stock + (reservedStock[product.id] ?? 0))
}

function lineFromProduct(
  product: CreateOrderProduct,
  quantity: number,
  options?: { size?: string; color?: string; bundle?: string },
): Omit<OrderLineDraft, 'key'> {
  const sizes = sizesForProduct(product)
  const size = options?.size && sizes.some((item) => item.name === options.size)
    ? options.size
    : (sizes[0]?.name ?? 'Standard')
  const colors = parseProductColors(product.colors)
  const color =
    options?.color && colors.some((item) => item.name === options.color)
      ? options.color
      : (colors[0]?.name ?? '')
  const bundles = parseProductBundles(product.bundles)
  const bundle =
    options?.bundle && bundles.some((item) => item.name === options.bundle)
      ? bundles.find((item) => item.name === options.bundle)
      : bundles[0]
  const packPrice =
    bundle?.price ?? priceForSize(sizes, size, parseFloat(product.price) || 0)

  return {
    productId: product.id,
    productName: product.name,
    productBrand: product.brand,
    size,
    color,
    bundle: bundle?.name ?? '',
    bundleUnits: bundle?.units ?? 1,
    quantity,
    price: packPrice,
  }
}

export function cartItemsFromLines(lines: OrderLineDraft[]): CartItem[] {
  return lines.map(({ productId, productName, productBrand, size, color, bundle, bundleUnits, quantity, price }) => ({
    productId,
    productName,
    productBrand,
    size,
    color: color || '',
    bundle: bundle || '',
    bundleUnits: bundleUnits || 1,
    quantity,
    price,
  }))
}

export function AdminOrderItemsEditor({
  products,
  deliveryFee,
  lines,
  onChange,
  reservedStock = {},
  disabled = false,
  error,
}: {
  products: CreateOrderProduct[]
  deliveryFee: number
  lines: OrderLineDraft[]
  onChange: (lines: OrderLineDraft[]) => void
  reservedStock?: Record<number, number>
  disabled?: boolean
  error?: string
}) {
  const [productId, setProductId] = useState('')
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const [bundleName, setBundleName] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [itemError, setItemError] = useState<string | null>(null)

  const productOptions = useMemo(
    () =>
      products.map((product) => ({
        value: String(product.id),
        label: `${product.brand} — ${product.name} (${parseFloat(product.price).toFixed(3)} TND · ${availableStock(product, reservedStock)} en stock)`,
      })),
    [products, reservedStock],
  )

  const selectedProduct = products.find((product) => String(product.id) === productId) ?? null
  const sizeOptions = useMemo(() => {
    if (!selectedProduct) return []
    const sizes = sizesForProduct(selectedProduct)
    const showPrices = hasVariableSizePrices(sizes)
    return sizes.map((item) => ({
      value: item.name,
      label: showPrices ? `${item.name} — ${item.price.toFixed(3)} TND` : item.name,
    }))
  }, [selectedProduct])
  const colorOptions = useMemo(() => {
    if (!selectedProduct) return []
    return parseProductColors(selectedProduct.colors).map((item) => ({
      value: item.name,
      label: item.name,
    }))
  }, [selectedProduct])
  const bundleOptions = useMemo(() => {
    if (!selectedProduct) return []
    return parseProductBundles(selectedProduct.bundles).map((bundle) => ({
      value: bundle.name,
      label: `${bundle.name} — ${bundle.price.toFixed(3)} TND`,
    }))
  }, [selectedProduct])
  const selectedBundle = selectedProduct
    ? parseProductBundles(selectedProduct.bundles).find((bundle) => bundle.name === bundleName)
    : undefined

  const subtotal = lines.reduce((acc, line) => acc + line.price * line.quantity, 0)
  const total = subtotal + deliveryFee

  function handleProductChange(nextId: string) {
    setProductId(nextId)
    setItemError(null)
    const product = products.find((item) => String(item.id) === nextId)
    if (!product) {
      setSize('')
      setColor('')
      setBundleName('')
      return
    }
    const draft = lineFromProduct(product, 1)
    setSize(draft.size)
    setColor(draft.color ?? '')
    setBundleName(draft.bundle ?? '')
  }

  function stockRoom(productIdValue: number, excludeKey?: string) {
    const product = products.find((item) => item.id === productIdValue)
    if (!product) return 0
    const already = lines
      .filter((line) => line.productId === productIdValue && line.key !== excludeKey)
      .reduce((sum, line) => sum + lineStockUnits(line.quantity, line.bundleUnits), 0)
    return Math.max(0, availableStock(product, reservedStock) - already)
  }

  function addLine() {
    if (!selectedProduct) {
      setItemError('Selectionnez un produit.')
      return
    }
    if (!size) {
      setItemError('Selectionnez une taille.')
      return
    }
    if (colorOptions.length > 0 && !color) {
      setItemError('Selectionnez une couleur.')
      return
    }
    if (bundleOptions.length > 0 && !bundleName) {
      setItemError('Selectionnez un pack.')
      return
    }
    const qty = parseInt(quantity, 10)
    if (!Number.isFinite(qty) || qty < 1) {
      setItemError('Quantite invalide.')
      return
    }

    const unitsPerPack = selectedBundle?.units ?? 1
    const room = stockRoom(selectedProduct.id)
    if (room < unitsPerPack) {
      setItemError('Stock insuffisant pour ce produit.')
      return
    }
    const addQty = Math.min(qty, Math.floor(room / unitsPerPack))
    const nextLine = lineFromProduct(selectedProduct, addQty, { size, color, bundle: bundleName })
    const existingIndex = lines.findIndex(
      (line) =>
        line.productId === nextLine.productId &&
        line.size === nextLine.size &&
        (line.color || '') === (nextLine.color || '') &&
        (line.bundle || '') === (nextLine.bundle || ''),
    )

    if (existingIndex >= 0) {
      onChange(
        lines.map((line, index) =>
          index === existingIndex ? { ...line, quantity: line.quantity + addQty } : line,
        ),
      )
    } else {
      onChange([
        ...lines,
        {
          ...nextLine,
          key: `${nextLine.productId}-${nextLine.size}-${nextLine.color}-${nextLine.bundle}-${Date.now()}`,
        },
      ])
    }

    setItemError(null)
    setQuantity('1')
  }

  function changeLineProduct(key: string, nextProductId: string) {
    const product = products.find((item) => String(item.id) === nextProductId)
    if (!product) return
    const current = lines.find((line) => line.key === key)
    if (!current) return
    const nextLine = lineFromProduct(product, current.quantity)
    const unitsPerPack = Math.max(1, nextLine.bundleUnits || 1)
    const room = stockRoom(product.id, key)
    const maxPacks = Math.max(1, Math.floor(room / unitsPerPack) || 1)
    onChange(
      lines.map((line) =>
        line.key === key
          ? { ...nextLine, key: line.key, quantity: Math.min(maxPacks, nextLine.quantity) }
          : line,
      ),
    )
  }

  function updateLineQuantity(key: string, nextQty: number) {
    if (!Number.isFinite(nextQty) || nextQty < 1) return
    onChange(
      lines.map((line) => {
        if (line.key !== key) return line
        const unitsPerPack = Math.max(1, line.bundleUnits || 1)
        const maxPacks = Math.max(1, Math.floor(stockRoom(line.productId, key) / unitsPerPack) || 1)
        return { ...line, quantity: Math.min(maxPacks, nextQty) }
      }),
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
      <p className={adminLabelCls}>ARTICLES *</p>
      <div className="mt-2 space-y-3">
        <AdminSelect
          value={productId}
          onValueChange={handleProductChange}
          items={productOptions}
          placeholder="Selectionner un produit..."
          disabled={disabled || products.length === 0}
        />
        <div className="grid grid-cols-2 gap-2">
          <AdminSelect
            value={size}
            onValueChange={setSize}
            items={sizeOptions}
            placeholder="Taille"
            disabled={disabled || !selectedProduct}
          />
          <AdminSelect
            value={color}
            onValueChange={setColor}
            items={colorOptions}
            placeholder="Couleur"
            disabled={disabled || !selectedProduct || colorOptions.length === 0}
          />
        </div>
        {bundleOptions.length > 0 ? (
          <AdminSelect
            value={bundleName}
            onValueChange={setBundleName}
            items={bundleOptions}
            placeholder="Pack"
            disabled={disabled || !selectedProduct}
          />
        ) : null}
        <div className="grid grid-cols-[88px_auto] gap-2">
          <input
            type="number"
            min={1}
            max={99}
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            className={adminInputCls}
            disabled={disabled}
            aria-label="Quantite a ajouter"
          />
          <AdminButton
            type="button"
            variant="outline"
            onClick={addLine}
            disabled={disabled}
            className="inline-flex items-center gap-1"
          >
            <Plus className="size-4" />
            Ajouter
          </AdminButton>
        </div>
        {(itemError || error) && <AdminFieldError message={itemError ?? error} />}
        {products.length === 0 && (
          <p className="text-xs text-slate-500">Aucun produit disponible dans le catalogue.</p>
        )}
      </div>

      {lines.length > 0 && (
        <ul className="mt-4 divide-y divide-slate-200 rounded-md border border-slate-200 bg-white">
          {lines.map((line) => (
            <li key={line.key} className="space-y-2 px-3 py-2.5">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <AdminSelect
                    value={String(line.productId)}
                    onValueChange={(value) => changeLineProduct(line.key, value)}
                    items={productOptions}
                    disabled={disabled}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    {line.size}
                    {line.color ? ` · ${line.color}` : ''}
                    {line.bundle ? ` · ${line.bundle}` : ''} · {line.price.toFixed(3)} TND / unite
                  </p>
                </div>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={line.quantity}
                  onChange={(event) =>
                    updateLineQuantity(line.key, parseInt(event.target.value, 10))
                  }
                  className={`${adminInputCls} !w-16 !py-1.5 text-center`}
                  disabled={disabled}
                  aria-label={`Quantite ${line.productName}`}
                />
                <p className="w-24 pt-2 text-right text-sm font-semibold tabular-nums text-slate-900">
                  {(line.price * line.quantity).toFixed(3)}
                </p>
                <AdminIconButton
                  label="Retirer l article"
                  variant="danger"
                  onClick={() => onChange(lines.filter((item) => item.key !== line.key))}
                  disabled={disabled}
                >
                  <Trash2 className="size-4" />
                </AdminIconButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 space-y-1 text-sm">
        <div className="flex justify-between text-slate-500">
          <span>Sous-total</span>
          <span className="tabular-nums">{subtotal.toFixed(3)} TND</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>Livraison</span>
          <span className="tabular-nums">
            {deliveryFee === 0 ? 'Gratuit' : `${deliveryFee.toFixed(3)} TND`}
          </span>
        </div>
        <div className="flex justify-between font-semibold text-slate-900">
          <span>Total</span>
          <span className="tabular-nums">{total.toFixed(3)} TND</span>
        </div>
      </div>
    </div>
  )
}
