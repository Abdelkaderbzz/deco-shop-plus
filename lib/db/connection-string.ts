/**
 * Neon (and many hosts) ship `sslmode=require`. Current `pg` treats that like
 * `verify-full`, but a future major will not — pin explicitly to silence the
 * warning and keep certificate verification.
 */
export function resolveDatabaseUrl(url = process.env.DATABASE_URL) {
  if (!url) return url

  try {
    const parsed = new URL(url)
    const mode = parsed.searchParams.get('sslmode')
    if (mode === 'require' || mode === 'prefer' || mode === 'verify-ca') {
      parsed.searchParams.set('sslmode', 'verify-full')
    }
    return parsed.toString()
  } catch {
    return url
  }
}
