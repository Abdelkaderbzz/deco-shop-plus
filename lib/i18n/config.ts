export const LOCALES = ['ar', 'fr'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'ar'
export const LOCALE_COOKIE = 'locale'

export const LOCALE_META: Record<
  Locale,
  { htmlLang: string; ogLocale: string; dir: 'rtl' | 'ltr'; contentLanguage: string }
> = {
  ar: { htmlLang: 'ar-TN', ogLocale: 'ar_TN', dir: 'rtl', contentLanguage: 'ar-TN' },
  fr: { htmlLang: 'fr-TN', ogLocale: 'fr_TN', dir: 'ltr', contentLanguage: 'fr-TN' },
}

export function isLocale(value: string | undefined | null): value is Locale {
  return value === 'ar' || value === 'fr'
}
