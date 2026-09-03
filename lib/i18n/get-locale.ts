import { cookies, headers } from 'next/headers'
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from '@/lib/i18n/config'
import { getDictionary, type Dictionary } from '@/lib/i18n/dictionary'

export async function getLocale(): Promise<Locale> {
  const fromHeader = (await headers()).get('x-locale')
  if (isLocale(fromHeader)) return fromHeader

  const value = (await cookies()).get(LOCALE_COOKIE)?.value
  return isLocale(value) ? value : DEFAULT_LOCALE
}

export async function getStorefrontI18n(): Promise<{ locale: Locale; dict: Dictionary }> {
  const locale = await getLocale()
  return { locale, dict: getDictionary(locale) }
}
