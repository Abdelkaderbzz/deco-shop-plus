import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, LOCALE_META } from '@/lib/i18n/config'

/* ------------------------------------------------------------------
 * Maintenance mode
 * Set MAINTENANCE_MODE=1 in the Vercel environment variables (then
 * redeploy) to show a "site en maintenance" page to visitors.
 * Admin and auth routes stay reachable so the site can still be fixed.
 * Set it to 0 or remove it to bring the site back online.
 * ------------------------------------------------------------------ */
const MAINTENANCE_HTML = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>Site en maintenance | Deco Shop Plus</title>
  <style>
    body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
           font-family: system-ui, sans-serif; background: #faf7f2; color: #2b2b2b; text-align: center; padding: 1.5rem; }
    h1 { font-size: 1.75rem; margin: 0 0 0.75rem; }
    p { margin: 0.25rem 0; color: #555; }
  </style>
</head>
<body>
  <main>
    <h1>Site en maintenance</h1>
    <p>Nous effectuons une mise à jour. Le site sera de retour très bientôt.</p>
    <p>Merci de votre patience.</p>
  </main>
</body>
</html>`

// Only the public production domains show the maintenance page.
// Other hosts (deco-shop-plus.vercel.app, previews, localhost) keep working
// normally so the site can still be checked while it is in maintenance.
const MAINTENANCE_HOSTS = new Set(['decoshopplus.com', 'www.decoshopplus.com'])

function isMaintenanceMode(request: NextRequest) {
  // On by default. Set MAINTENANCE_MODE=0 to bring the site back online.
  if (process.env.MAINTENANCE_MODE === '0') return false
  const host = (request.headers.get('host') ?? '').split(':')[0].toLowerCase()
  return MAINTENANCE_HOSTS.has(host)
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdmin =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api/auth')

  if (isMaintenanceMode(request) && !isAdmin) {
    return new NextResponse(MAINTENANCE_HTML, {
      status: 503,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Retry-After': '3600',
        'Cache-Control': 'no-store',
      },
    })
  }

  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value
  const locale = isAdmin ? 'fr' : isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-storefront', isAdmin ? '0' : '1')
  requestHeaders.set('x-locale', locale)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })
  response.headers.set('Content-Language', LOCALE_META[locale].contentLanguage)

  if (!isAdmin && !isLocale(cookieLocale)) {
    response.cookies.set(LOCALE_COOKIE, DEFAULT_LOCALE, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|assets/).*)'],
}
