/** Read Meta browser cookies for Conversions API attribution. */
export function readMetaCookies() {
  if (typeof document === 'undefined') return {}

  const read = (name: string) => {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
    return match?.[1] ?? undefined
  }

  return {
    fbp: read('_fbp'),
    fbc: read('_fbc'),
  }
}

export function readMetaAttribution() {
  return {
    ...readMetaCookies(),
    eventSourceUrl: typeof window !== 'undefined' ? window.location.href : undefined,
  }
}
