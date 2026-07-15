'use client'

import { useEffect, useRef, useState } from 'react'

type Testimonial = {
  id: string
  platform: 'instagram' | 'whatsapp' | 'facebook'
  username: string
  message: string
  time: string
  avatar: string
  storyRing?: boolean
  delay: number
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    platform: 'instagram',
    username: 'fedi.alaya',
    message: 'Famam Fi Sousse hedhom ?',
    time: '7 sem',
    avatar: 'FA',
    delay: 0,
  },
  {
    id: '2',
    platform: 'whatsapp',
    username: 'beyahaw',
    message: 'نجم ناخذ وتو توصلي للدار عن طريق ليفرور',
    time: '14:32',
    avatar: 'BY',
    delay: 120,
  },
  {
    id: '3',
    platform: 'instagram',
    username: 'ala_chafroud',
    message: '❤️ ❤️',
    time: '7 sem',
    avatar: 'AC',
    storyRing: true,
    delay: 240,
  },
  {
    id: '4',
    platform: 'facebook',
    username: 'Zizou Ben Ali',
    message: 'Parfums De Marly Althaïr walla esmha la camorra 🥴',
    time: '29 sem',
    avatar: 'ZB',
    delay: 360,
  },
  {
    id: '5',
    platform: 'whatsapp',
    username: 'Olfa Ali',
    message: 'الريحة تحفة برشا، شكرا Jannah Parfume 🙏',
    time: '09:15',
    avatar: 'OA',
    delay: 480,
  },
  {
    id: '6',
    platform: 'instagram',
    username: 'olfa.ali_',
    message: '❤️ ❤️ ❤️ ❤️ ❤️',
    time: '3 j',
    avatar: 'OL',
    delay: 600,
  },
  {
    id: '7',
    platform: 'facebook',
    username: 'Hamed Sadraoui',
    message: 'خدمة ممتازة والتوصيل في الوقت. ننصح بيهم.',
    time: '2 j',
    avatar: 'HS',
    delay: 720,
  },
  {
    id: '8',
    platform: 'whatsapp',
    username: 'Sarra M.',
    message: 'وصلتني الطلبية اليوم، العطر أصلي 100% ✨',
    time: '18:47',
    avatar: 'SM',
    delay: 840,
  },
]

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, visible }
}

function Avatar({
  label,
  storyRing,
  platform,
}: {
  label: string
  storyRing?: boolean
  platform: Testimonial['platform']
}) {
  const colors = {
    instagram: 'from-pink-500 via-purple-500 to-orange-400',
    whatsapp: 'from-emerald-500 to-teal-600',
    facebook: 'from-blue-500 to-blue-700',
  }

  const inner = (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${colors[platform]} text-[10px] font-semibold text-white`}
    >
      {label}
    </div>
  )

  if (storyRing) {
    return (
      <div className="rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
        <div className="rounded-full bg-[#121212] p-[2px]">{inner}</div>
      </div>
    )
  }

  return inner
}

function InstagramCard({ item, visible }: { item: Testimonial; visible: boolean }) {
  return (
    <div
      className="rounded-2xl bg-[#121212] px-4 py-3.5 shadow-lg shadow-black/20"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.96)',
        transition: `opacity 0.6s ease ${item.delay}ms, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${item.delay}ms`,
      }}
    >
      <div className="mb-2 flex items-center gap-1.5 text-[10px] text-white/40">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
        </svg>
        Instagram
      </div>
      <div className="flex gap-3">
        <Avatar label={item.avatar} storyRing={item.storyRing} platform="instagram" />
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-snug text-white">
            <span className="font-semibold">{item.username}</span>{' '}
            <span className="font-normal">{item.message}</span>
          </p>
          <div className="mt-1.5 flex items-center gap-3 text-[11px] text-white/40">
            <span>{item.time}</span>
            <button type="button" className="font-medium hover:text-white/60">
              Repondre
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function WhatsAppCard({ item, visible }: { item: Testimonial; visible: boolean }) {
  return (
    <div
      className="overflow-hidden rounded-2xl bg-[#0b141a] shadow-lg shadow-black/25"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0) scale(1)' : 'translateX(-24px) scale(0.95)',
        transition: `opacity 0.65s ease ${item.delay}ms, transform 0.65s cubic-bezier(0.22, 1, 0.36, 1) ${item.delay}ms`,
      }}
    >
      <div className="flex items-center gap-2 border-b border-white/5 bg-[#1f2c34] px-4 py-2.5">
        <Avatar label={item.avatar} platform="whatsapp" />
        <div>
          <p className="text-sm font-medium text-white">{item.username}</p>
          <p className="text-[10px] text-emerald-400">en ligne</p>
        </div>
      </div>
      <div
        className="relative px-3 py-4"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        <div
          className="relative max-w-[88%] rounded-lg rounded-tl-none bg-[#005c4b] px-3 py-2 shadow-sm"
          style={{
            animation: visible ? `testimonial-bubble-pop 0.4s ease ${item.delay + 200}ms both` : 'none',
          }}
        >
          <p className="text-[13px] leading-relaxed text-[#e9edef]">{item.message}</p>
          <div className="mt-1 flex items-center justify-end gap-1">
            <span className="text-[10px] text-white/50">{item.time}</span>
            <svg width="14" height="10" viewBox="0 0 16 11" fill="#53bdeb">
              <path d="M11.071.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-6.19 7.636-2.405-2.272a.463.463 0 0 0-.336-.146.47.47 0 0 0-.343.146.445.445 0 0 0-.14.334.43.43 0 0 0 .146.331l2.932 2.77a.463.463 0 0 0 .326.127.48.48 0 0 0 .313-.114l6.566-8.099a.43.43 0 0 0 .096-.323.444.444 0 0 0-.172-.3z" />
              <path d="M15.266.653a.457.457 0 0 0-.304-.102.493.493 0 0 0-.381.178l-8.79 10.86-1.09-1.03a.463.463 0 0 0-.336-.146.47.47 0 0 0-.343.146.445.445 0 0 0-.14.334.43.43 0 0 0 .146.331l1.617 1.53a.463.463 0 0 0 .326.127.48.48 0 0 0 .313-.114l9.166-11.32a.43.43 0 0 0 .096-.323.444.444 0 0 0-.172-.3z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

function FacebookCard({ item, visible }: { item: Testimonial; visible: boolean }) {
  return (
    <div
      className="rounded-2xl border border-white/5 bg-[#242526] px-4 py-3.5 shadow-lg shadow-black/20"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) rotate(0deg)' : 'translateY(24px) rotate(-1deg)',
        transition: `opacity 0.6s ease ${item.delay}ms, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${item.delay}ms`,
      }}
    >
      <div className="mb-2.5 flex items-center gap-1.5 text-[10px] text-blue-400">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        Facebook
      </div>
      <div className="flex gap-3">
        <Avatar label={item.avatar} platform="facebook" />
        <div className="min-w-0 flex-1">
          <div className="inline-block rounded-2xl bg-[#3a3b3c] px-3 py-2">
            <p className="text-xs font-semibold text-white">{item.username}</p>
            <p className="mt-0.5 text-sm leading-snug text-[#e4e6eb]">{item.message}</p>
          </div>
          <div className="mt-1.5 flex items-center gap-4 text-[11px] font-semibold text-[#b0b3b8]">
            <span>{item.time}</span>
            <button type="button">J&apos;aime</button>
            <button type="button">Repondre</button>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <div className="flex -space-x-1">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[8px]">👍</span>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px]">❤️</span>
            </div>
            <span className="text-[11px] text-[#b0b3b8]">12</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function TestimonialCard({ item, visible }: { item: Testimonial; visible: boolean }) {
  switch (item.platform) {
    case 'instagram':
      return <InstagramCard item={item} visible={visible} />
    case 'whatsapp':
      return <WhatsAppCard item={item} visible={visible} />
    case 'facebook':
      return <FacebookCard item={item} visible={visible} />
  }
}

export function TestimonialsSection() {
  const { ref, visible } = useInView(0.1)

  return (
    <section className="border-t border-border bg-secondary/30 py-20">
      <div ref={ref} className="mx-auto max-w-6xl px-4">
        <div
          className="mb-14 text-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          <p className="text-[10px] font-light tracking-[0.4em] text-primary">TEMOIGNAGES</p>
          <h2 className="mt-2 font-serif text-3xl font-light tracking-widest text-foreground">
            ILS NOUS FONT CONFIANCE
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm font-light text-muted-foreground">
            Des messages reels de nos clients sur Instagram, WhatsApp et Facebook.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((item, i) => (
            <div
              key={item.id}
              className={`testimonial-float ${i % 3 === 1 ? 'lg:mt-8' : i % 3 === 2 ? 'lg:-mt-4' : ''}`}
            >
              <TestimonialCard item={item} visible={visible} />
            </div>
          ))}
        </div>

        <div
          className="mt-12 flex flex-wrap items-center justify-center gap-6 text-[11px] font-light tracking-widest text-muted-foreground"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.8s ease 900ms',
          }}
        >
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-pink-500 to-orange-400" />
            Instagram
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            WhatsApp
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Facebook
          </span>
        </div>
      </div>

      <style jsx global>{`
        .testimonial-float:nth-child(3n + 1) {
          animation: testimonial-float-soft 6s ease-in-out infinite;
        }
        .testimonial-float:nth-child(3n + 2) {
          animation: testimonial-float-soft 7s ease-in-out 1s infinite;
        }
        .testimonial-float:nth-child(3n) {
          animation: testimonial-float-soft 5.5s ease-in-out 0.5s infinite;
        }
      `}</style>
    </section>
  )
}
