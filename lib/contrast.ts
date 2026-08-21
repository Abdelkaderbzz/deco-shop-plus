const HEX = /^#([0-9a-fA-F]{6})$/

function parseHex(value: string): [number, number, number] | null {
  const match = HEX.exec(value.trim())
  if (!match) return null
  const n = Number.parseInt(match[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function channel(value: number) {
  const c = value / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function luminance(rgb: [number, number, number]) {
  return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2])
}

export function contrastRatio(foreground: string, background: string): number {
  const fg = parseHex(foreground)
  const bg = parseHex(background)
  if (!fg || !bg) return 1
  const lighter = Math.max(luminance(fg), luminance(bg))
  const darker = Math.min(luminance(fg), luminance(bg))
  return (lighter + 0.05) / (darker + 0.05)
}

const DARK = '#1a2220'
const LIGHT = '#f7fbfa'

/** Picks black or white (or the preferred hex) so small text stays at 4.5:1. */
export function readableForeground(background: string, preferred?: string | null): string {
  if (preferred && contrastRatio(preferred, background) >= 4.5) return preferred
  return contrastRatio(LIGHT, background) >= contrastRatio(DARK, background) ? LIGHT : DARK
}
