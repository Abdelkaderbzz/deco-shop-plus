'use client'

import { MarqueeRow } from '@/components/testimonial-marquee'
import { useI18n } from '@/lib/i18n/provider'
import {
  TESTIMONIAL_SOURCES,
  facebookTestimonials,
  socialTestimonials,
  usedTestimonialSources,
} from '@/lib/testimonials'

const ROW_DURATION_SECONDS = { top: 78, bottom: 94 } as const

export function TestimonialsSection() {
  const sources = usedTestimonialSources()
  const { dict } = useI18n()

  return (
    <section className="below-fold border-t border-border bg-secondary py-12 md:py-14">
      <div className="mx-auto mb-8 max-w-7xl px-2 text-center sm:px-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-primary">{dict.testimonials.eyebrow}</p>
        <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight text-foreground">
          {dict.testimonials.title}
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
          {dict.testimonials.subtitle}
        </p>
      </div>

      <div className="relative border-y border-border/60">
        <div className="flex flex-col gap-1 py-1">
          <MarqueeRow
            items={facebookTestimonials()}
            direction="left"
            duration={ROW_DURATION_SECONDS.top}
          />
          <MarqueeRow
            items={socialTestimonials()}
            direction="right"
            duration={ROW_DURATION_SECONDS.bottom}
          />
        </div>

        <div className="pointer-events-none absolute inset-y-0 start-0 z-10 w-8 bg-linear-to-r from-secondary to-transparent rtl:bg-linear-to-l sm:w-20 lg:w-28" />
        <div className="pointer-events-none absolute inset-y-0 end-0 z-10 w-8 bg-linear-to-l from-secondary to-transparent rtl:bg-linear-to-r sm:w-20 lg:w-28" />
      </div>

      {sources.length > 0 ? (
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-[11px] font-medium tracking-widest text-muted-foreground">
          {sources.map((source) => (
            <span key={source} className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${TESTIMONIAL_SOURCES[source].dotClass}`} />
              {TESTIMONIAL_SOURCES[source].label}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  )
}
