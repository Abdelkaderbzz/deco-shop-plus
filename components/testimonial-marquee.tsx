'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { FacebookCommentCard, InstagramCommentCard, WhatsAppCommentCard } from '@/components/testimonial-cards'
import type { TestimonialItem } from '@/lib/testimonials'

const ITEM_CLS = 'flex w-72 shrink-0 px-1 py-1 sm:w-80 lg:w-[22rem]'

function repeatsFor(count: number) {
  // Enough cards so one pass is wider than the viewport on large screens.
  return Math.max(2, Math.ceil(6 / Math.max(count, 1)))
}

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

export function MarqueeRow({
  items,
  direction,
  duration,
}: {
  items: TestimonialItem[]
  direction: 'left' | 'right'
  duration: number
}) {
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduceMotion(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  if (items.length === 0) return null

  const pass = Array.from({ length: repeatsFor(items.length) }, () => items).flat()
  const loop = [...pass, ...pass]

  return (
    <div className="marquee py-1">
      <ul
        className="marquee-track"
        data-direction={direction}
        data-paused={reduceMotion ? '' : undefined}
        style={{ '--marquee-duration': `${duration}s` } as React.CSSProperties}
        aria-label={direction === 'left' ? 'Avis clients' : undefined}
      >
        {loop.map((item, index) => (
          <TestimonialItemCard
            key={`${item.id}-${index}`}
            item={item}
            decorative={index >= pass.length}
          />
        ))}
      </ul>
    </div>
  )
}
