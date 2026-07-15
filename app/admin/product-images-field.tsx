'use client'

import { uploadProductImages } from '@/app/actions/upload'
import { useToast } from '@/components/toast-provider'
import { MAX_PRODUCT_IMAGES } from '@/lib/product-images'
import { useRef, useState } from 'react'
import { AdminButton, adminLabelCls } from './admin-ui'

type ProductImagesFieldProps = {
  value: string[]
  onChange: (urls: string[]) => void
  error?: string
}

export function ProductImagesField({ value, onChange, error }: ProductImagesFieldProps) {
  const toast = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const remainingSlots = MAX_PRODUCT_IMAGES - value.length

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? [])
    if (selected.length === 0) return

    if (remainingSlots <= 0) {
      toast.error(`Maximum ${MAX_PRODUCT_IMAGES} images par produit.`)
      return
    }

    const maxBytes = 5 * 1024 * 1024
    const oversized = selected.find((file) => file.size > maxBytes)
    if (oversized) {
      toast.error(`"${oversized.name}" depasse 5 Mo. Choisissez une image plus legere.`)
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    const files = selected.slice(0, remainingSlots)
    if (selected.length > remainingSlots) {
      toast.error(`Seules ${remainingSlots} image(s) supplementaire(s) acceptee(s).`)
    }

    setUploading(true)
    try {
      const formData = new FormData()
      for (const file of files) {
        formData.append('files', file)
      }

      const result = await uploadProductImages(formData)
      if (!result.success) {
        toast.error(result.error)
        return
      }

      onChange([...value, ...result.urls].slice(0, MAX_PRODUCT_IMAGES))
      toast.success(
        result.urls.length > 1
          ? `${result.urls.length} images televersees avec succes.`
          : 'Image televersee avec succes.',
      )
    } catch {
      toast.error('Impossible de televerser les images.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function removeImage(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label className={adminLabelCls}>
        IMAGES ({value.length}/{MAX_PRODUCT_IMAGES})
      </label>

      {value.length > 0 && (
        <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((url, index) => (
            <div key={`${url}-${index}`} className="relative overflow-hidden rounded-md border border-slate-200">
              <img src={url} alt={`Image ${index + 1}`} className="h-28 w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                disabled={uploading}
                className="absolute right-2 top-2 rounded bg-white/90 px-2 py-1 text-xs font-medium text-red-600 shadow hover:bg-white disabled:opacity-60"
              >
                Retirer
              </button>
              {index === 0 && (
                <span className="absolute bottom-2 left-2 rounded bg-amber-700 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                  Principale
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {remainingSlots > 0 && (
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          disabled={uploading}
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-amber-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-amber-900 hover:file:bg-amber-200 disabled:opacity-60"
        />
      )}

      <p className="mt-2 text-sm text-slate-500">
        Televersez jusqu a {MAX_PRODUCT_IMAGES} images (5 Mo chacune). La premiere image est utilisee
        comme image principale en boutique.
      </p>

      {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
      {uploading && <p className="mt-2 text-sm text-amber-700">Televersement en cours...</p>}

      {value.length > 0 && (
        <AdminButton
          type="button"
          variant="ghost"
          className="mt-3"
          onClick={() => onChange([])}
          disabled={uploading}
        >
          Supprimer toutes les images
        </AdminButton>
      )}
    </div>
  )
}
