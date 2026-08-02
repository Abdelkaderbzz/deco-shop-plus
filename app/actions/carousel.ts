'use server'

import { requireAdminId } from '@/lib/admin-auth'
import { DEFAULT_CAROUSEL_REELS, normalizeInstagramReelUrl } from '@/lib/carousel-videos'
import { db } from '@/lib/db'
import { carouselVideos } from '@/lib/db/schema'
import { asc, eq } from 'drizzle-orm'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'

export type CarouselVideoRow = {
  id: number
  url: string
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export type CarouselActionResult =
  | { success: true; video?: CarouselVideoRow; videos?: CarouselVideoRow[] }
  | { success: false; error: string }

async function listCarouselVideos() {
  return db
    .select()
    .from(carouselVideos)
    .orderBy(asc(carouselVideos.sortOrder), asc(carouselVideos.id))
}

async function revalidateCarouselPaths() {
  revalidateTag('carousel', 'max')
  revalidatePath('/admin/carousel')
  revalidatePath('/')
}

const getCarouselUrlsCached = unstable_cache(
  async () => {
    const rows = await listCarouselVideos()
    if (rows.length === 0) return DEFAULT_CAROUSEL_REELS
    return rows.map((row) => row.url)
  },
  ['carousel-urls'],
  { revalidate: 300, tags: ['carousel'] },
)

export async function getCarouselVideos() {
  return listCarouselVideos()
}

export async function getCarouselVideoUrls() {
  return getCarouselUrlsCached()
}

function mapCarouselError(error: unknown, fallback: string) {
  if (error instanceof Error) {
    const message = error.message
    if (message.includes('23505') || message.toLowerCase().includes('unique')) {
      return 'Ce reel Instagram est deja present dans le carousel.'
    }
    if (message.trim()) return message
  }
  return fallback
}

async function persistSortOrder(ids: number[]) {
  const now = new Date()
  await db.transaction(async (tx) => {
    await Promise.all(
      ids.map((id, index) =>
        tx
          .update(carouselVideos)
          .set({ sortOrder: index, updatedAt: now })
          .where(eq(carouselVideos.id, id)),
      ),
    )
  })
}

export async function addCarouselVideo(url: string): Promise<CarouselActionResult> {
  try {
    await requireAdminId()

    const normalized = normalizeInstagramReelUrl(url)
    if (!normalized) {
      return { success: false, error: 'Lien Instagram reel invalide.' }
    }

    const rows = await listCarouselVideos()
    if (rows.some((row) => row.url === normalized)) {
      return { success: false, error: 'Ce reel Instagram est deja present dans le carousel.' }
    }

    const [video] = await db
      .insert(carouselVideos)
      .values({
        url: normalized,
        sortOrder: rows.length,
      })
      .returning()

    await revalidateCarouselPaths()
    return { success: true, video }
  } catch (error) {
    return {
      success: false,
      error: mapCarouselError(error, "Impossible d'ajouter la video."),
    }
  }
}

export async function updateCarouselVideo(id: number, url: string): Promise<CarouselActionResult> {
  try {
    await requireAdminId()

    const normalized = normalizeInstagramReelUrl(url)
    if (!normalized) {
      return { success: false, error: 'Lien Instagram reel invalide.' }
    }

    const rows = await listCarouselVideos()
    const duplicate = rows.find((row) => row.url === normalized && row.id !== id)
    if (duplicate) {
      return { success: false, error: 'Ce reel Instagram est deja present dans le carousel.' }
    }

    const [video] = await db
      .update(carouselVideos)
      .set({ url: normalized, updatedAt: new Date() })
      .where(eq(carouselVideos.id, id))
      .returning()

    if (!video) {
      return { success: false, error: 'Video introuvable.' }
    }

    await revalidateCarouselPaths()
    return { success: true, video }
  } catch (error) {
    return {
      success: false,
      error: mapCarouselError(error, 'Impossible de modifier la video.'),
    }
  }
}

export async function deleteCarouselVideo(id: number): Promise<CarouselActionResult> {
  try {
    await requireAdminId()

    const rows = await listCarouselVideos()
    const remainingIds = rows.filter((row) => row.id !== id).map((row) => row.id)
    if (remainingIds.length === rows.length) {
      return { success: false, error: 'Video introuvable.' }
    }

    await db.delete(carouselVideos).where(eq(carouselVideos.id, id))
    await persistSortOrder(remainingIds)
    await revalidateCarouselPaths()

    const videos = await listCarouselVideos()
    return { success: true, videos }
  } catch (error) {
    return {
      success: false,
      error: mapCarouselError(error, 'Impossible de supprimer la video.'),
    }
  }
}

export async function moveCarouselVideo(
  id: number,
  direction: 'up' | 'down',
): Promise<CarouselActionResult> {
  try {
    await requireAdminId()

    const rows = await listCarouselVideos()
    const index = rows.findIndex((row) => row.id === id)
    if (index === -1) {
      return { success: false, error: 'Video introuvable.' }
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= rows.length) {
      return { success: true, videos: rows }
    }

    const ids = rows.map((row) => row.id)
    ;[ids[index], ids[targetIndex]] = [ids[targetIndex], ids[index]]

    await persistSortOrder(ids)
    await revalidateCarouselPaths()

    const videos = await listCarouselVideos()
    return { success: true, videos }
  } catch (error) {
    return {
      success: false,
      error: mapCarouselError(error, 'Impossible de deplacer la video.'),
    }
  }
}
