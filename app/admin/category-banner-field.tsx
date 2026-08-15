'use client'

import { uploadProductImage } from '@/app/actions/upload'
import { useToast } from '@/components/toast-provider'
import { useRef, useState } from 'react'
import { AdminButton, adminLabelCls } from './admin-ui'

type CategoryBannerFieldProps = {
  value: string
  onChange: (url: string) => void
  label?: string
  hint?: string
}

export function CategoryBannerField({
  value,
  onChange,
  label = 'BANNIERE CATEGORIE',
  hint = 'Image affichee sur la boutique (grille et banniere de categorie). 5 Mo maximum.',
}: CategoryBannerFieldProps) {
  const toast = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const maxBytes = 5 * 1024 * 1024
    if (file.size > maxBytes) {
      toast.error(`"${file.name}" depasse 5 Mo. Choisissez une image plus legere.`)
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const result = await uploadProductImage(formData)
      if (!result.success) {
        toast.error(result.error)
        return
      }

      onChange(result.url)
      toast.success('Banniere televersee avec succes.')
    } catch {
      toast.error('Impossible de televerser la banniere.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <label className={adminLabelCls}>{label}</label>

      {value ? (
        <div className="relative mb-3 overflow-hidden rounded-md border border-slate-200">
          <img src={value} alt={label} className="h-36 w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            disabled={uploading}
            className="absolute right-2 top-2 rounded bg-white/90 px-2 py-1 text-xs font-medium text-red-600 shadow hover:bg-white disabled:opacity-60"
          >
            Retirer
          </button>
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileChange}
        disabled={uploading}
        className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-amber-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-amber-900 hover:file:bg-amber-200 disabled:opacity-60"
      />

      <p className="mt-2 text-sm text-slate-500">{hint}</p>

      {uploading && <p className="mt-2 text-sm text-amber-700">Televersement en cours...</p>}
    </div>
  )
}
