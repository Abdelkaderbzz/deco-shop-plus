import type { Dictionary } from '@/lib/i18n/dictionary'
import type { HeroSlide } from '@/lib/hero-slides'

export function localizeHeroSlide(slide: HeroSlide, dict: Dictionary): HeroSlide {
  const copy = dict.hero.slides[slide.id]
  const ctaLabel = copy?.ctaLabel ?? dict.hero.cta[slide.ctaLabel] ?? slide.ctaLabel
  if (!copy) {
    return { ...slide, ctaLabel }
  }
  return {
    ...slide,
    alt: copy.alt,
    eyebrow: copy.eyebrow,
    title: copy.title,
    subtitle: copy.subtitle,
    ctaLabel,
  }
}
