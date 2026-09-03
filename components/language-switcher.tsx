'use client'

import { setLocale } from '@/lib/i18n/actions'
import type { Locale } from '@/lib/i18n/config'
import { useI18n } from '@/lib/i18n/provider'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

export function LanguageSwitcher() {
  const { locale, dict } = useI18n()
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function choose(next: Locale) {
    if (next === locale || pending) return
    startTransition(async () => {
      await setLocale(next)
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-0.5 text-[11px] font-semibold tracking-wide" role="group" aria-label={dict.lang.switchTo}>
      <button
        type="button"
        onClick={() => choose('ar')}
        disabled={pending}
        className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-2 transition-colors ${
          locale === 'ar' ? 'bg-primary text-primary-foreground' : 'text-foreground/70 hover:text-primary'
        }`}
        aria-pressed={locale === 'ar'}
        lang="ar"
      >
        ع
      </button>
      <button
        type="button"
        onClick={() => choose('fr')}
        disabled={pending}
        className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-2 transition-colors ${
          locale === 'fr' ? 'bg-primary text-primary-foreground' : 'text-foreground/70 hover:text-primary'
        }`}
        aria-pressed={locale === 'fr'}
        lang="fr"
      >
        FR
      </button>
    </div>
  )
}
