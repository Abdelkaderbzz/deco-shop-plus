/** Price formatting stays Latin digits (TND). Storefront UI language is `lib/i18n`. */
export const SITE_LANG = 'fr'
export const SITE_LOCALE = 'fr-TN'
export const SITE_OG_LOCALE = 'fr_TN'

export function formatDateFr(value: Date | string | number) {
  return new Date(value).toLocaleDateString(SITE_LOCALE)
}
