import { STORE_FAQS } from '@/lib/site'

export function StoreFaq() {
  return (
    <section className="below-fold border-t border-border py-14 md:py-16" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-3xl px-2 sm:px-3">
        <div className="mb-10 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-primary">Questions</p>
          <h2 id="faq-heading" className="mt-2 font-serif text-3xl font-medium tracking-tight text-foreground">
            Questions fréquentes
          </h2>
        </div>
        <dl className="divide-y divide-border border-y border-border">
          {STORE_FAQS.map((item) => (
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
