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
  { file: 'categories/textiles.webp', url: 'https://images.unsplash.com/photo-1616627561839-074385245ff6?auto=format&fit=crop&w=1200&q=80', w: 1200 },
  { file: 'boutiques/storefront.webp', url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80', w: 1200 },
  { file: 'boutiques/interior.webp', url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80', w: 1200 },
  { file: 'products/cushion-velvet.webp', url: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1000&q=80', w: 1000 },
  { file: 'products/cushion-linen.webp', url: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=1000&q=80', w: 1000 },
  { file: 'products/cushion-embroidered.webp', url: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1000&q=80', w: 1000 },
  { file: 'products/cushion-set.webp', url: 'https://images.unsplash.com/photo-1505691938895-1758d7a833ca?auto=format&fit=crop&w=1000&q=80', w: 1000 },
  { file: 'products/vase.webp', url: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=1000&q=80', w: 1000 },
  { file: 'products/mirror.webp', url: 'https://images.unsplash.com/photo-1615874958471-ea142f76a06d?auto=format&fit=crop&w=1000&q=80', w: 1000 },
  { file: 'products/tray.webp', url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1000&q=80', w: 1000 },
  { file: 'products/lantern.webp', url: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1000&q=80', w: 1000 },
  { file: 'products/drawer-org.webp', url: 'https://images.unsplash.com/photo-1558997519-83ea9252c09a?auto=format&fit=crop&w=1000&q=80', w: 1000 },
  { file: 'products/garment-cover.webp', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80', w: 1000 },
  { file: 'products/fabric-box.webp', url: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1000&q=80', w: 1000 },
  { file: 'products/basket.webp', url: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=80', w: 1000 },
  { file: 'products/plaid.webp', url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1000&q=80', w: 1000 },
  { file: 'products/coverlet.webp', url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1000&q=80', w: 1000 },
  { file: 'products/tablecloth.webp', url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=80', w: 1000 },
  { file: 'products/curtain.webp', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80', w: 1000 },
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
