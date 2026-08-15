import Image from 'next/image'
import { InstagramCommentCard, WhatsAppCommentCard } from '@/components/testimonial-cards'
import {
  TESTIMONIAL_SOURCES,
  googleTestimonials,
  socialTestimonials,
  usedTestimonialSources,
  type TestimonialItem,
} from '@/lib/testimonials'

/** Seconds for one full pass. Higher = slower drift. */
const ROW_DURATION_SECONDS = { top: 78, bottom: 94 } as const

/** How many times the item list repeats inside a single pass. One pass must be
 *  wider than the viewport or a gap opens at the trailing edge. Short rows
 *  (Google screenshots) need more copies than the mixed social row. */
function repeatsFor(count: number) {
  return Math.max(2, Math.ceil(8 / Math.max(count, 1)))
}

/** Shared by every card so both rows line up and nothing shrinks mid-animation. */
const ITEM_CLS = 'h-36 shrink-0 overflow-hidden sm:h-40 lg:h-46'

/** Comments are HTML, so unlike screenshots they need an explicit width. */
const COMMENT_WIDTH_CLS = 'w-72 sm:w-80 lg:w-96'

function TestimonialItemCard({ item, decorative }: { item: TestimonialItem; decorative: boolean }) {
  if (item.kind === 'screenshot') {
    return (
      <li className={`${ITEM_CLS} border-r border-black/5 bg-white`}>
        <Image
          src={item.src}
          alt={decorative ? '' : item.alt}
          width={item.width}
          height={item.height}
          sizes="(max-width: 640px) 400px, (max-width: 1024px) 460px, 540px"
          draggable={false}
          // Lazy loading never fires reliably inside the animated track, which
          // leaves blank cards drifting into view. These are a few KB each and
          // repeat across both rows, so the browser fetches them once.
          loading="eager"
          className="block h-full w-auto select-none"
        />
      </li>
    )
  }

  return (
    <li className={`${ITEM_CLS} ${COMMENT_WIDTH_CLS} border-r border-white/5`}>
      {item.source === 'instagram' ? (
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
    <section className="border-t border-border bg-secondary py-20">
      <div className="mx-auto mb-14 max-w-6xl px-4 text-center">
        <p className="text-[10px] font-light tracking-[0.4em] text-primary">TEMOIGNAGES</p>
        <h2 className="mt-2 font-serif text-3xl font-light tracking-widest text-foreground">
          ELLES NOUS FONT CONFIANCE
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm font-light text-muted-foreground">
          Avis Google, commentaires Instagram et messages WhatsApp de nos clientes.
        </p>
      </div>

      <div className="relative border-y border-border/60">
        <MarqueeRow
          items={googleTestimonials()}
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

      {sources.length > 0 ? (
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-[11px] font-light tracking-widest text-muted-foreground">
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
