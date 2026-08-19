import Link from 'next/link'
import { SITE } from '@/lib/site'

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-primary">404</p>
      <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground">
        Page introuvable
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        Cette page n’existe pas ou a été déplacée. Découvrez coussins, accessoires et literie chez{' '}
        {SITE.name} à {SITE.neighborhood}, {SITE.city}.
      </p>
      <Link
        href="/"
        className="rounded-full border border-border px-8 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
      >
        Retour à l’accueil
      </Link>
    </main>
  )
}
