'use server'

import { requireAdminId } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { settings } from '@/lib/db/schema'
import { BANNER_VARIANTS, type BannerVariant, type SiteBannerFormValues } from '@/lib/validations'
import { eq } from 'drizzle-orm'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'

const DEFAULT_DELIVERY_FEE = '7.000'

const EMPTY_BANNER: SiteBannerFormValues = {
  bannerEnabled: false,
  bannerMessage: '',
  bannerVariant: 'offer',
  bannerLinkLabel: '',
  bannerLinkHref: '',
}

export async function getDeliveryFee() {
  const [row] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1)
  return parseFloat(row?.deliveryFee ?? DEFAULT_DELIVERY_FEE)
}

export async function getSettings() {
  await requireAdminId()
  const [row] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1)
  return {
    deliveryFee: row?.deliveryFee ?? DEFAULT_DELIVERY_FEE,
    updatedAt: row?.updatedAt ?? new Date(),
  }
}

export async function updateDeliveryFee(deliveryFee: string) {
  await requireAdminId()
  const fee = parseFloat(deliveryFee)
  if (Number.isNaN(fee) || fee < 0) throw new Error('Invalid delivery fee')

  await db
    .insert(settings)
    .values({ id: 1, deliveryFee: fee.toFixed(3), updatedAt: new Date() })
    .onConflictDoUpdate({
      target: settings.id,
      set: { deliveryFee: fee.toFixed(3), updatedAt: new Date() },
    })

  revalidatePath('/admin/settings')
  revalidatePath('/checkout')
  revalidatePath('/products')
}

function normalizeVariant(value: string): BannerVariant {
  return (BANNER_VARIANTS as readonly string[]).includes(value)
    ? (value as BannerVariant)
    : 'offer'
}

const getSiteBannerCached = unstable_cache(
  async (): Promise<SiteBannerFormValues> => {
    const [row] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1)
    if (!row) return EMPTY_BANNER
    return {
      bannerEnabled: row.bannerEnabled,
      bannerMessage: row.bannerMessage,
      bannerVariant: normalizeVariant(row.bannerVariant),
      bannerLinkLabel: row.bannerLinkLabel,
      bannerLinkHref: row.bannerLinkHref,
    }
  },
  ['site-banner'],
  { revalidate: 300, tags: ['site-banner'] },
)

/** Storefront read. Returns null when there is nothing to show. */
export async function getSiteBanner() {
  const banner = await getSiteBannerCached()
  if (!banner.bannerEnabled || banner.bannerMessage.trim() === '') return null
  return banner
}

export async function getAdminSiteBanner() {
  await requireAdminId()
  const [row] = await db.select().from(settings).where(eq(settings.id, 1)).limit(1)
  if (!row) return EMPTY_BANNER
  return {
    bannerEnabled: row.bannerEnabled,
    bannerMessage: row.bannerMessage,
    bannerVariant: normalizeVariant(row.bannerVariant),
    bannerLinkLabel: row.bannerLinkLabel,
    bannerLinkHref: row.bannerLinkHref,
  }
}

export async function updateSiteBanner(data: SiteBannerFormValues) {
  await requireAdminId()

  const values = {
    bannerEnabled: data.bannerEnabled,
    bannerMessage: data.bannerMessage.trim(),
    bannerVariant: normalizeVariant(data.bannerVariant),
    bannerLinkLabel: data.bannerLinkLabel.trim(),
    bannerLinkHref: data.bannerLinkHref.trim(),
    updatedAt: new Date(),
  }

  await db
    .insert(settings)
    .values({ id: 1, deliveryFee: DEFAULT_DELIVERY_FEE, ...values })
    .onConflictDoUpdate({ target: settings.id, set: values })

  revalidateTag('site-banner', 'max')
  revalidatePath('/admin/banner')
  revalidatePath('/', 'layout')
}
