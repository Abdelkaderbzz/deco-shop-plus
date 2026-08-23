import { FACEBOOK_URL, PHONE_HREF, WHATSAPP_URL } from '@/lib/social-links'
import { SITE } from '@/lib/site'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  )
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M21 16.9v2.4a1.5 1.5 0 01-1.6 1.5 16.3 16.3 0 01-7.1-2.5 16 16 0 01-4.9-4.9A16.3 16.3 0 014.9 6.3 1.5 1.5 0 016.4 4.7h2.4a1.5 1.5 0 011.5 1.3c.1.8.3 1.6.6 2.4a1.5 1.5 0 01-.4 1.6l-1 1a12.7 12.7 0 004.9 4.9l1-1a1.5 1.5 0 011.6-.4c.8.3 1.6.5 2.4.6a1.5 1.5 0 011.3 1.5z" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.03H7.9v-2.9h2.54V9.84c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34V22c4.78-.75 8.44-4.91 8.44-9.93z" />
    </svg>
  )
}

const followButtonCls =
  'inline-flex min-h-11 items-center gap-2.5 rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary'

export function InstagramSectionHeader() {
  return (
    <div className="mb-8 text-center">
      <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-primary">Commande</p>
      <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight text-foreground">
        Ecrivez-nous
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
        Stock du jour, coussins et rangement — reponse rapide sur WhatsApp.
      </p>
    </div>
  )
}

export function InstagramFollowButton() {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
      <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={followButtonCls}>
        <WhatsAppIcon />
        WhatsApp
      </a>
      <a href={PHONE_HREF} className={followButtonCls}>
        <PhoneIcon />
        {SITE.phoneDisplay}
      </a>
      <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className={followButtonCls}>
        <FacebookIcon />
        Facebook
      </a>
    </div>
  )
}
