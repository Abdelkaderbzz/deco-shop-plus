import Image from 'next/image'
import { FacebookCommentCard, InstagramCommentCard, WhatsAppCommentCard } from '@/components/testimonial-cards'
import { Reveal } from '@/components/reveal'
import {
  TESTIMONIAL_SOURCES,
  facebookTestimonials,
  socialTestimonials,
  usedTestimonialSources,
  type TestimonialItem,
} from '@/lib/testimonials'

/** Seconds for one full pass. Higher = slower drift. */
const ROW_DURATION_SECONDS = { top: 78, bottom: 94 } as const

/** How many times the item list repeats inside a single pass. One pass must be
 *  wider than the viewport or a gap opens at the trailing edge. Short rows
 *  (Facebook comments) need more copies than the mixed social row. */
function repeatsFor(count: number) {
  return Math.max(2, Math.ceil(8 / Math.max(count, 1)))
}

/** Shared by every card so both rows stretch to the tallest review. */
const ITEM_CLS = 'flex w-72 shrink-0 px-1 py-1 sm:w-80 lg:w-[22rem]'

function TestimonialItemCard({ item, decorative }: { item: TestimonialItem; decorative: boolean }) {
  if (item.kind === 'screenshot') {
    return (
      <li className={ITEM_CLS}>
        <div className="flex min-h-full flex-1 overflow-hidden rounded-xl bg-white shadow-[0_8px_24px_-16px_rgba(15,23,42,0.45)]">
          <Image
            src={item.src}
            alt={decorative ? '' : item.alt}
            width={item.width}
            height={item.height}
            sizes="(max-width: 640px) 400px, (max-width: 1024px) 460px, 540px"
            draggable={false}
            loading="lazy"
            className="block h-full w-full object-cover select-none"
          />
        </div>
      </li>
    )
  }

  return (
    <li className={ITEM_CLS}>
      {item.source === 'facebook' ? (
        <FacebookCommentCard item={item} />
      ) : item.source === 'instagram' ? (
        <InstagramCommentCard item={item} />
      ) : (
        <WhatsAppCommentCard item={item} />
      )}
    </li>
  )
}

function MarqueeRow({
  items,
  direction,
  duration,
}: {
  items: TestimonialItem[]
  direction: 'left' | 'right'
  duration: number
}) {
  if (items.length === 0) return null

  const pass = Array.from({ length: repeatsFor(items.length) }, () => items).flat()

  return (
    <div className="marquee">
      <ul
        className="marquee-track"
        data-direction={direction}
        style={{ '--marquee-duration': `${duration}s` } as React.CSSProperties}
      >
        {[...pass, ...pass].map((item, index) => {
          // Only the first run of unique items is exposed to assistive tech; the
          // rest exist purely to make the loop seamless.
          const decorative = index >= items.length
          return (
            <TestimonialItemCard
              key={`${item.id}-${index}`}
              item={item}
              decorative={decorative}
            />
          )
        })}
      </ul>
    </div>
  )
}

export function TestimonialsSection() {
  const sources = usedTestimonialSources()

  return (
    <section className="border-t border-border bg-secondary py-12 md:py-14">
      <div className="mx-auto mb-8 max-w-7xl px-2 text-center sm:px-3">
        <Reveal>
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-primary">Avis</p>
          <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight text-foreground">
            Elles nous font confiance
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
            Commentaires Facebook, messages WhatsApp et Instagram a Bizerte.
          </p>
        </Reveal>
      </div>

      <Reveal variant="fade">
        <div className="relative border-y border-border/60">
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

          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-linear-to-r from-secondary to-transparent sm:w-20 lg:w-28" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-linear-to-l from-secondary to-transparent sm:w-20 lg:w-28" />
        </div>
      </Reveal>

      {sources.length > 0 ? (
        <Reveal className="mt-12 flex flex-wrap items-center justify-center gap-6 text-[11px] font-light tracking-widest text-muted-foreground" delay={80}>
          {sources.map((source) => (
            <span key={source} className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${TESTIMONIAL_SOURCES[source].dotClass}`} />
              {TESTIMONIAL_SOURCES[source].label}
            </span>
          ))}
        </Reveal>
      ) : null}
    </section>
  )
}
