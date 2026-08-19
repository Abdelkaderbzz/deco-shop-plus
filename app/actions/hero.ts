'use server'

import { requireAdminId } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { heroImages, heroSlides } from '@/lib/db/schema'
import { DEFAULT_HERO_IMAGES, HERO_SLOT_COUNT, mergeHeroImages, type HeroImageSlot } from '@/lib/hero-images'
import {
  DEFAULT_HERO_SLIDES,
  isHeroCtaTarget,
  type HeroCtaTarget,
  type HeroSlide,
} from '@/lib/hero-slides'
import { heroSlideSchema } from '@/lib/validations'
import { asc, desc, eq } from 'drizzle-orm'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'

export type HeroActionResult =
  | { success: true; images: HeroImageSlot[] }
  | { success: false; error: string }

export type HeroSlideActionResult =
  | { success: true; slides: HeroSlide[] }
  | { success: false; error: string }

type HeroSlideInput = {
  imageUrl: string
  alt?: string
  eyebrow?: string
  title: string
  subtitle?: string
  ctaLabel: string
  ctaTarget: string
  ctaHref?: string
  published?: boolean
}

function mapHeroSlide(row: typeof heroSlides.$inferSelect): HeroSlide {
  return {
    id: row.id,
    imageUrl: row.imageUrl,
    alt: row.alt,
    eyebrow: row.eyebrow,
    title: row.title,
    subtitle: row.subtitle,
    ctaLabel: row.ctaLabel,
    ctaTarget: isHeroCtaTarget(row.ctaTarget) ? row.ctaTarget : 'products',
    ctaHref: row.ctaHref,
    published: row.published,
    sortOrder: row.sortOrder,
  }
}

async function listHeroRows() {
  return db.select().from(heroImages).orderBy(asc(heroImages.slot))
}

async function listHeroSlideRows(publishedOnly = false) {
  const rows = publishedOnly
    ? await db
        .select()
        .from(heroSlides)
        .where(eq(heroSlides.published, true))
        .orderBy(asc(heroSlides.sortOrder), desc(heroSlides.createdAt))
    : await db
        .select()
        .from(heroSlides)
        .orderBy(asc(heroSlides.sortOrder), desc(heroSlides.createdAt))
  return rows.map(mapHeroSlide)
}

async function revalidateHeroPaths() {
  revalidateTag('hero-images', 'max')
  revalidateTag('hero-slides', 'max')
  revalidatePath('/admin/hero')
  revalidatePath('/')
}

const getHeroImagesCached = unstable_cache(
  async () => mergeHeroImages(await listHeroRows()),
  ['hero-images'],
  { revalidate: 300, tags: ['hero-images'] },
)

const getHeroSlidesCached = unstable_cache(
  async () => {
    const slides = await listHeroSlideRows(true)
    return slides.length > 0 ? slides : DEFAULT_HERO_SLIDES
  },
  ['hero-slides'],
  { revalidate: 120, tags: ['hero-slides'] },
)

export async function getHeroImages(): Promise<HeroImageSlot[]> {
  return getHeroImagesCached()
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  return getHeroSlidesCached()
}

export async function getAdminHeroImages(): Promise<HeroImageSlot[]> {
  await requireAdminId()
  return mergeHeroImages(await listHeroRows())
}

export async function getAdminHeroSlides(): Promise<HeroSlide[]> {
  await requireAdminId()
  return listHeroSlideRows(false)
}

function parseSlideInput(data: HeroSlideInput) {
  const parsed = heroSlideSchema.safeParse({
    imageUrl: data.imageUrl,
    alt: data.alt ?? '',
    eyebrow: data.eyebrow ?? '',
    title: data.title,
    subtitle: data.subtitle ?? '',
    ctaLabel: data.ctaLabel,
    ctaTarget: data.ctaTarget as HeroCtaTarget,
    ctaHref: data.ctaHref ?? '',
    published: data.published ?? true,
  })

  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? 'Donnees invalides.' }
  }

  return { success: true as const, data: parsed.data }
}

export async function createHeroSlide(data: HeroSlideInput): Promise<HeroSlideActionResult> {
  try {
    await requireAdminId()
    const parsed = parseSlideInput(data)
    if (!parsed.success) return parsed

    const [last] = await db
      .select({ sortOrder: heroSlides.sortOrder })
      .from(heroSlides)
      .orderBy(desc(heroSlides.sortOrder))
      .limit(1)

    await db.insert(heroSlides).values({
      ...parsed.data,
      sortOrder: (last?.sortOrder ?? -1) + 1,
      updatedAt: new Date(),
    })

    await revalidateHeroPaths()
    return { success: true, slides: await listHeroSlideRows(false) }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Impossible d'ajouter le slide.",
    }
  }
}

export async function updateHeroSlide(
  id: number,
  data: HeroSlideInput,
): Promise<HeroSlideActionResult> {
  try {
    await requireAdminId()
    if (!Number.isInteger(id) || id < 1) {
      return { success: false, error: 'Slide invalide.' }
    }

    const parsed = parseSlideInput(data)
    if (!parsed.success) return parsed

    await db
      .update(heroSlides)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(heroSlides.id, id))

    await revalidateHeroPaths()
    return { success: true, slides: await listHeroSlideRows(false) }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Impossible d'enregistrer le slide.",
    }
  }
}

export async function deleteHeroSlide(id: number): Promise<HeroSlideActionResult> {
  try {
    await requireAdminId()
    if (!Number.isInteger(id) || id < 1) {
      return { success: false, error: 'Slide invalide.' }
    }

    await db.delete(heroSlides).where(eq(heroSlides.id, id))
    await revalidateHeroPaths()
    return { success: true, slides: await listHeroSlideRows(false) }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Impossible de supprimer le slide.',
    }
  }
}

export async function moveHeroSlide(
  id: number,
  direction: 'up' | 'down',
): Promise<HeroSlideActionResult> {
  try {
    await requireAdminId()
    const slides = await listHeroSlideRows(false)
    const index = slides.findIndex((slide) => slide.id === id)
    if (index < 0) return { success: false, error: 'Slide introuvable.' }

    const swapIndex = direction === 'up' ? index - 1 : index + 1
    const current = slides[index]
    const other = slides[swapIndex]
    if (!other) return { success: true, slides }

    await db.update(heroSlides).set({ sortOrder: other.sortOrder, updatedAt: new Date() }).where(eq(heroSlides.id, current.id))
    await db.update(heroSlides).set({ sortOrder: current.sortOrder, updatedAt: new Date() }).where(eq(heroSlides.id, other.id))

    await revalidateHeroPaths()
    return { success: true, slides: await listHeroSlideRows(false) }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Impossible de reordonner le slide.",
    }
  }
}

export async function updateHeroImage(
  slot: number,
  data: { imageUrl: string; alt?: string },
): Promise<HeroActionResult> {
  try {
    await requireAdminId()

    if (!Number.isInteger(slot) || slot < 0 || slot >= HERO_SLOT_COUNT) {
      return { success: false, error: 'Emplacement invalide.' }
    }

    const imageUrl = data.imageUrl.trim()
    if (!imageUrl) {
      return { success: false, error: 'Image requise.' }
    }

    const fallback = DEFAULT_HERO_IMAGES[slot]
    const alt = data.alt?.trim() || fallback.alt

    await db
      .insert(heroImages)
      .values({
        slot,
        imageUrl,
        alt,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: heroImages.slot,
        set: {
          imageUrl,
          alt,
          updatedAt: new Date(),
        },
      })

    await revalidateHeroPaths()
    return { success: true, images: mergeHeroImages(await listHeroRows()) }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Impossible d'enregistrer l image.",
    }
  }
}

export async function resetHeroImage(slot: number): Promise<HeroActionResult> {
  try {
    await requireAdminId()

    if (!Number.isInteger(slot) || slot < 0 || slot >= HERO_SLOT_COUNT) {
      return { success: false, error: 'Emplacement invalide.' }
    }

    const fallback = DEFAULT_HERO_IMAGES[slot]
    await db
      .insert(heroImages)
      .values({
        slot,
        imageUrl: fallback.imageUrl,
        alt: fallback.alt,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: heroImages.slot,
        set: {
          imageUrl: fallback.imageUrl,
          alt: fallback.alt,
          updatedAt: new Date(),
        },
      })

    await revalidateHeroPaths()
    return { success: true, images: mergeHeroImages(await listHeroRows()) }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Impossible de restaurer l image.",
    }
  }
}
