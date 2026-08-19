import Image from 'next/image'
import { phoneHref, type Boutique } from '@/lib/boutiques'
import { WHATSAPP_URL } from '@/lib/social-links'
import { Reveal } from '@/components/reveal'

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.5l2.9 6.2 6.6.9-4.8 4.7 1.2 6.7L12 17.8l-5.9 3.2 1.2-6.7L2.5 9.6l6.6-.9L12 2.5z" />
    </svg>
  )
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1116 0z" />
      <circle cx="12" cy="10" r="2.75" />
    </svg>
  )
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path d="M21 16.9v2.4a1.5 1.5 0 01-1.6 1.5 16.3 16.3 0 01-7.1-2.5 16 16 0 01-4.9-4.9A16.3 16.3 0 014.9 6.3 1.5 1.5 0 016.4 4.7h2.4a1.5 1.5 0 011.5 1.3c.1.8.3 1.6.6 2.4a1.5 1.5 0 01-.4 1.6l-1 1a12.7 12.7 0 004.9 4.9l1-1a1.5 1.5 0 011.6-.4c.8.3 1.6.5 2.4.6a1.5 1.5 0 011.3 1.5z" />
    </svg>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z" />
    </svg>
  )
}

const actionCls =
  'inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary'

function BoutiqueHero({ boutique }: { boutique: Boutique }) {
  const badge = (boutique.region || boutique.city).toUpperCase()

  return (
    <div className="relative aspect-4/3 overflow-hidden bg-secondary">
      {boutique.image ? (
        <Image
          src={boutique.image}
          alt={boutique.imageAlt || boutique.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-primary/40">
          <PinIcon className="size-10" />
        </div>
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent" />
      <span className="absolute bottom-4 left-5 flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-[10px] font-light tracking-[0.3em] text-white backdrop-blur-sm">
        <PinIcon className="shrink-0" />
        {badge}
      </span>
    </div>
  )
}

function BoutiqueCard({ boutique }: { boutique: Boutique }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-border/80 bg-card transition-all duration-500 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10">
      {boutique.directionsUrl ? (
        <a
          href={boutique.directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <BoutiqueHero boutique={boutique} />
        </a>
      ) : (
        <BoutiqueHero boutique={boutique} />
      )}

      <div className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-serif text-2xl font-medium tracking-tight text-foreground">
            {boutique.city}
          </h3>
          {boutique.rating != null ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-light tracking-wider text-primary">
                <StarIcon />
                {boutique.rating.toFixed(1)}
              </span>
              <span className="text-[11px] font-light tracking-wider text-muted-foreground">
                {boutique.reviewCount ? `${boutique.reviewCount} avis · ` : ''}
                {boutique.ratingSource}
              </span>
            </div>
          ) : null}
        </div>

        {boutique.description ? (
          <p className="mt-4 text-sm font-light leading-relaxed text-muted-foreground">
            {boutique.description}
          </p>
        ) : null}

        {boutique.address || boutique.phone ? (
          <dl className="mt-5 space-y-2.5 border-t border-border/60 pt-5">
            {boutique.address ? (
              <div className="flex items-start gap-2.5">
                <dt className="mt-0.5 text-primary">
                  <PinIcon className="shrink-0" />
                  <span className="sr-only">Adresse</span>
                </dt>
                <dd className="text-sm font-light text-muted-foreground">{boutique.address}</dd>
              </div>
            ) : null}
            {boutique.phone ? (
              <div className="flex items-start gap-2.5">
                <dt className="mt-0.5 text-primary">
                  <PhoneIcon className="shrink-0" />
                  <span className="sr-only">Telephone</span>
                </dt>
                <dd>
                  <a
                    href={phoneHref(boutique.phone)}
                    className="text-sm font-light tracking-wide text-muted-foreground transition-colors hover:text-primary hover:underline"
                  >
                    +216 {boutique.phone}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          {boutique.directionsUrl ? (
            <a
              href={boutique.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={actionCls}
            >
              <PinIcon />
              Itineraire
            </a>
          ) : null}
          {boutique.phone ? (
            <a href={phoneHref(boutique.phone)} className={actionCls}>
              <PhoneIcon />
              Appeler
            </a>
          ) : null}
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={actionCls}>
            <WhatsAppIcon />
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  )
}

function buildTagline(boutiques: Boutique[]) {
  const cities = [...new Set(boutiques.map((boutique) => boutique.city))]
  if (cities.length === 0) return ''
  if (cities.length === 1) return `Venez decouvrir la boutique a ${cities[0]}.`

  const last = cities[cities.length - 1]
  return `Retrouvez-nous a ${cities.slice(0, -1).join(', ')} et ${last}.`
}

export function BoutiquesSection({ boutiques }: { boutiques: Boutique[] }) {
  if (boutiques.length === 0) return null

  return (
    <section id="boutique" className="scroll-mt-16 border-t border-border bg-secondary/35 py-14 md:py-16">
      <div className="mx-auto max-w-7xl px-2 sm:px-3">
        <Reveal className="mb-10 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-primary">Adresse</p>
          <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight text-foreground">
            La boutique
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm font-light text-muted-foreground">
            {buildTagline(boutiques)}
          </p>
        </Reveal>

        <div
          className={`grid gap-6 ${
            boutiques.length === 1 ? 'mx-auto max-w-xl' : 'md:grid-cols-2'
          }`}
        >
          {boutiques.map((boutique, index) => (
            <Reveal key={boutique.id} variant={index % 2 === 0 ? 'left' : 'right'} delay={index * 90}>
              <BoutiqueCard boutique={boutique} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
