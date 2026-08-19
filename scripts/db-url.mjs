export function pickDatabaseUrl() {
  return process.env.DATABASE_URL?.trim() || undefined
}

export function databaseHost(url) {
  try {
    return new URL(url).host
  } catch {
    return '(invalid)'
  }
}

/** Pin Neon-style sslmode so `pg` stops warning about require/prefer/verify-ca. */
export function resolveDatabaseUrl(url = pickDatabaseUrl()) {
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
