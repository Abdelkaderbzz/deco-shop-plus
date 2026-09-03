import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, LOCALE_META } from '@/lib/i18n/config'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdmin =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api/auth')

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
