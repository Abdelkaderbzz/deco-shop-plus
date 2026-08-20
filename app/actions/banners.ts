'use server'

import { requireAdminId } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { banners } from '@/lib/db/schema'
import {
  BANNER_FONT_SIZE_MAX,
  BANNER_FONT_SIZE_MIN,
  BANNER_VARIANTS,
  type BannerFormValues,
  type BannerVariant,
} from '@/lib/validations'
import { and, desc, eq, ne } from 'drizzle-orm'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import { cache } from 'react'

export type BannerRow = typeof banners.$inferSelect

export type BannerActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string }

/** What the storefront banner needs to render. */
export type ActiveBanner = {
  id: number
  message: string
  variant: BannerVariant
  backgroundColor: string
  textColor: string
  fontSize: number
  linkLabel: string
  linkHref: string
  dismissible: boolean
}

function normalizeVariant(value: string): BannerVariant {
  return (BANNER_VARIANTS as readonly string[]).includes(value)
    ? (value as BannerVariant)
    : 'offer'
}

function clampFontSize(value: number) {
  if (!Number.isFinite(value)) return 13
  return Math.min(BANNER_FONT_SIZE_MAX, Math.max(BANNER_FONT_SIZE_MIN, Math.round(value)))
}

function revalidateBanners() {
  revalidateTag('active-banner', 'max')
  revalidatePath('/admin/banner')
  revalidatePath('/', 'layout')
}

const getActiveBannerCached = unstable_cache(
  async () => {
    const [row] = await db
      .select()
      .from(banners)
      .where(eq(banners.active, true))
      .orderBy(desc(banners.updatedAt))
      .limit(1)
    return row ?? null
  },
  ['active-banner'],
  { revalidate: 300, tags: ['active-banner'] },
)

/** Storefront read. Returns null when nothing is published. */
export const getActiveBanner = cache(async (): Promise<ActiveBanner | null> => {
  const row = await getActiveBannerCached()
  if (!row || row.message.trim() === '') return null

  return {
    id: row.id,
    message: row.message,
    variant: normalizeVariant(row.variant),
    backgroundColor: row.backgroundColor,
    textColor: row.textColor,
    fontSize: clampFontSize(row.fontSize),
    linkLabel: row.linkLabel,
    linkHref: row.linkHref,
    dismissible: row.dismissible,
  }
})

export async function getAdminBanners(): Promise<BannerRow[]> {
  await requireAdminId()
  return db.select().from(banners).orderBy(desc(banners.active), desc(banners.updatedAt))
}

function toRowValues(data: BannerFormValues) {
  return {
    name: data.name.trim(),
    message: data.message.trim(),
    variant: normalizeVariant(data.variant),
    backgroundColor: data.backgroundColor,
    textColor: data.textColor,
    fontSize: clampFontSize(data.fontSize),
    linkLabel: data.linkLabel.trim(),
    linkHref: data.linkHref.trim(),
    dismissible: data.dismissible,
    active: data.active,
  }
}

/** Only one banner shows at a time, so publishing one retires the others. */
async function deactivateOthers(keepId?: number) {
  await db
    .update(banners)
    .set({ active: false })
    .where(keepId ? and(eq(banners.active, true), ne(banners.id, keepId)) : eq(banners.active, true))
}

export async function addBanner(data: BannerFormValues): Promise<BannerActionResult<BannerRow>> {
  try {
    await requireAdminId()

    if (data.active) await deactivateOthers()

    const [row] = await db.insert(banners).values(toRowValues(data)).returning()

    revalidateBanners()
    return { success: true, data: row }
  } catch {
    return { success: false, error: "Impossible d'enregistrer la banniere." }
  }
}

export async function updateBanner(
  id: number,
  data: BannerFormValues,
): Promise<BannerActionResult<BannerRow>> {
  try {
    await requireAdminId()

    if (data.active) await deactivateOthers(id)

    const [row] = await db
      .update(banners)
      .set({ ...toRowValues(data), updatedAt: new Date() })
      .where(eq(banners.id, id))
      .returning()

    if (!row) {
      return { success: false, error: 'Banniere introuvable.' }
    }

    revalidateBanners()
    return { success: true, data: row }
  } catch {
    return { success: false, error: 'Impossible de modifier la banniere.' }
  }
}

/** Publish one banner, or unpublish everything when active is false. */
export async function setActiveBanner(
  id: number,
  active: boolean,
): Promise<BannerActionResult<BannerRow[]>> {
  try {
    await requireAdminId()

    if (active) await deactivateOthers(id)

    const [row] = await db
      .update(banners)
      .set({ active, updatedAt: new Date() })
      .where(eq(banners.id, id))
      .returning({ id: banners.id })

    if (!row) {
      return { success: false, error: 'Banniere introuvable.' }
    }

    revalidateBanners()
    const rows = await db.select().from(banners).orderBy(desc(banners.active), desc(banners.updatedAt))
    return { success: true, data: rows }
  } catch {
    return { success: false, error: 'Impossible de publier la banniere.' }
  }
}

export async function deleteBanner(id: number): Promise<BannerActionResult> {
  try {
    await requireAdminId()

    const [row] = await db.delete(banners).where(eq(banners.id, id)).returning({ id: banners.id })
    if (!row) {
      return { success: false, error: 'Banniere introuvable.' }
    }

    revalidateBanners()
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: 'Impossible de supprimer la banniere.' }
  }
}

/** Copy a saved banner so the admin can tweak a variation. */
export async function duplicateBanner(id: number): Promise<BannerActionResult<BannerRow>> {
  try {
    await requireAdminId()

    const [source] = await db.select().from(banners).where(eq(banners.id, id)).limit(1)
    if (!source) {
      return { success: false, error: 'Banniere introuvable.' }
    }

    const [row] = await db
      .insert(banners)
      .values({
        name: `${source.name || 'Banniere'} (copie)`,
        message: source.message,
        variant: source.variant,
        backgroundColor: source.backgroundColor,
        textColor: source.textColor,
        fontSize: source.fontSize,
        linkLabel: source.linkLabel,
        linkHref: source.linkHref,
        dismissible: source.dismissible,
        active: false,
      })
      .returning()

    revalidateBanners()
    return { success: true, data: row }
  } catch {
    return { success: false, error: 'Impossible de dupliquer la banniere.' }
  }
}
