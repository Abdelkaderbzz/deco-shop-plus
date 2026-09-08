/** Products sold as a fixed multi-piece pack where each piece needs its own color. */
const COLOR_SLOTS_BY_SLUG: Record<string, number> = {
  'pack-de-4-galettes-de-chaise-rondes-capitonnees': 4,
}

export function colorSlotsForProduct(slug: string | null | undefined, name?: string | null): number {
  if (slug && COLOR_SLOTS_BY_SLUG[slug]) return COLOR_SLOTS_BY_SLUG[slug]

  const fromName = String(name ?? '').match(/pack\s+de\s+(\d+)/i)
  if (fromName) {
    const n = Number.parseInt(fromName[1] ?? '', 10)
    if (n >= 2 && n <= 12) return n
  }

  return 1
}

export function formatSlotColors(colors: string[]): string {
  return colors
    .map((name, index) => `${index + 1}: ${name}`)
    .filter((line) => !line.endsWith(': '))
    .join(' · ')
}
