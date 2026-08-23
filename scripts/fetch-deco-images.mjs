// Download lifestyle photos then compress to WebP for the Deco Shop Plus catalog.
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public')

const IMAGES = [
  { file: 'hero/cushions-living.webp', url: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=1400&q=80', w: 1400 },
  { file: 'hero/sofa-style.webp', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1400&q=80', w: 1400 },
  { file: 'hero/bedroom-linen.webp', url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1400&q=80', w: 1400 },
  { file: 'hero/closet-organize.webp', url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1400&q=80', w: 1400 },
  { file: 'categories/coussins.webp', url: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=1200&q=80', w: 1200 },
  { file: 'categories/accessoires.webp', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80', w: 1200 },
  { file: 'categories/rangement.webp', url: 'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=1200&q=80', w: 1200 },
  { file: 'boutiques/storefront.webp', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80', w: 1200 },
  { file: 'boutiques/interior.webp', url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80', w: 1200 },
]

async function fetchImage(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'DecoShopPlus/1.0 (catalog seed)' },
  })
  if (!response.ok) throw new Error(`${response.status} ${url}`)
  return Buffer.from(await response.arrayBuffer())
}

async function run() {
  for (const image of IMAGES) {
    const outputPath = path.join(root, image.file)
    await mkdir(path.dirname(outputPath), { recursive: true })
    try {
      const buffer = await fetchImage(image.url)
      await sharp(buffer)
        .rotate()
        .resize({ width: image.w, withoutEnlargement: true })
        .webp({ quality: 74, effort: 5 })
        .toFile(outputPath)
      console.log('✓', image.file)
    } catch (error) {
      console.error('✗', image.file, error.message)
    }
  }
}

await run()
