'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { FacebookCommentCard, InstagramCommentCard, WhatsAppCommentCard } from '@/components/testimonial-cards'
import type { TestimonialItem } from '@/lib/testimonials'

const ITEM_CLS = 'flex w-72 shrink-0 px-1 py-1 sm:w-80 lg:w-[22rem]'

function repeatsFor(count: number) {
  return Math.max(1, Math.ceil(4 / Math.max(count, 1)))
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
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: '80px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  if (items.length === 0) return null

  const pass = Array.from({ length: repeatsFor(items.length) }, () => items).flat()

  return (
    <div ref={ref} className="marquee">
      <ul
        className="marquee-track"
        data-direction={direction}
        data-active={active ? 'true' : undefined}
        style={{ '--marquee-duration': `${duration}s` } as React.CSSProperties}
      >
        {[...pass, ...pass].map((item, index) => (
          <TestimonialItemCard
            key={`${item.id}-${index}`}
            item={item}
            decorative={index >= items.length}
          />
        ))}
      </ul>
    </div>
  )
}
