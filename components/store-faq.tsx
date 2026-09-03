'use client'

import { useI18n } from '@/lib/i18n/provider'

export function StoreFaq() {
  const { dict } = useI18n()
  return (
    <section className="below-fold border-t border-border py-14 md:py-16" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-3xl px-2 sm:px-3">
        <div className="mb-10 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-primary">{dict.faq.eyebrow}</p>
          <h2 id="faq-heading" className="mt-2 font-serif text-3xl font-medium tracking-tight text-foreground">
            {dict.faq.title}
          </h2>
        </div>
        <dl className="divide-y divide-border border-y border-border">
          {dict.faq.items.map((item) => (
            <div key={item.question} className="py-5">
              <dt className="font-medium text-foreground">{item.question}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
