'use server'

import { auth } from '@/lib/auth'
import { getCloudinary, getCloudinaryConfig, isCloudinaryConfigured } from '@/lib/cloudinary'
import { MAX_PRODUCT_IMAGES } from '@/lib/product-images'
import { headers } from 'next/headers'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Non autorise')
}

function validateFile(file: File): string | null {
  if (file.size === 0) return 'Fichier vide.'
  if (!ALLOWED_TYPES.has(file.type)) {
    return 'Format non supporte. Utilisez JPG, PNG, WEBP ou GIF.'
  }
  if (file.size > MAX_FILE_SIZE) return 'Fichier trop volumineux (5 Mo maximum).'
  return null
}

async function uploadBuffer(buffer: Buffer) {
  const { folder } = getCloudinaryConfig()
  const cloudinary = getCloudinary()

  return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, uploadResult) => {
          if (error || !uploadResult?.secure_url) {
            reject(error ?? new Error('Echec du televersement'))
            return
          }
          resolve({
            secure_url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
          })
        },
      )
      .end(buffer)
  })
}

export type UploadImageResult =
  | { success: true; url: string; publicId: string }
  | { success: false; error: string }

export type UploadImagesResult =
  | { success: true; urls: string[] }
  | { success: false; error: string }

export async function uploadProductImage(formData: FormData): Promise<UploadImageResult> {
  try {
    await requireAdmin()

    if (!isCloudinaryConfigured()) {
      return { success: false, error: 'Cloudinary n est pas configure.' }
    }

    const file = formData.get('file')
    if (!(file instanceof File)) {
      return { success: false, error: 'Aucun fichier selectionne.' }
    }

    const validationError = validateFile(file)
    if (validationError) return { success: false, error: validationError }

    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await uploadBuffer(buffer)

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Impossible de televerser l image.',
    }
  }
}

export async function uploadProductImages(formData: FormData): Promise<UploadImagesResult> {
  try {
    await requireAdmin()

    if (!isCloudinaryConfigured()) {
      return { success: false, error: 'Cloudinary n est pas configure.' }
    }

    const files = formData
      .getAll('files')
      .filter((entry): entry is File => entry instanceof File && entry.size > 0)

    if (files.length === 0) {
      return { success: false, error: 'Aucun fichier selectionne.' }
    }

    if (files.length > MAX_PRODUCT_IMAGES) {
      return { success: false, error: `Maximum ${MAX_PRODUCT_IMAGES} images par produit.` }
    }

    const urls: string[] = []

    for (const file of files) {
      const validationError = validateFile(file)
      if (validationError) return { success: false, error: validationError }

      const buffer = Buffer.from(await file.arrayBuffer())
      const result = await uploadBuffer(buffer)
      urls.push(result.secure_url)
    }

    return { success: true, urls }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Impossible de televerser les images.',
    }
  }
}
