export const DEFAULT_CAROUSEL_REELS = [
  'https://www.instagram.com/reel/DZ3XNGpsShF/',
  'https://www.instagram.com/reel/DYdIM1eMPri/',
  'https://www.instagram.com/reel/DaTQO_4RzjP/',
  'https://www.instagram.com/reel/DZvMI4OsOJd/',
]

export function normalizeInstagramReelUrl(url: string) {
  const trimmed = url.trim()
  const match = trimmed.match(/instagram\.com\/reel\/([^/?#]+)/i)
  if (!match?.[1]) return null
  return `https://www.instagram.com/reel/${match[1]}/`
}

export function extractInstagramReelId(url: string) {
  const normalized = normalizeInstagramReelUrl(url)
  if (!normalized) return ''
  const match = normalized.match(/reel\/([^/?]+)/)
  return match?.[1] ?? ''
}
