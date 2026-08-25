import sharp from 'sharp'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets')

/** Crop to a square around the product, then output a sharp webp. */
const crops = [
  { file: 'rug-cover-hero.webp', left: 38, top: 76, size: 310 },
  { file: 'rug-cover-sizes.webp', left: 285, top: 95, size: 400 },
  { file: 'rug-cover-drawstring.webp', left: 0, top: 0, size: 250 },
  { file: 'rug-cover-fabric.webp', left: 160, top: 50, size: 192 },
  { file: 'rug-cover-closet.webp', left: 0, top: 0, size: 242 },
  { file: 'rug-cover-organized.webp', left: 50, top: 90, size: 220 },
  { file: 'rug-cover-transport.webp', left: 50, top: 30, size: 280 },
]

for (const crop of crops) {
  const input = join(dir, crop.file)
  const meta = await sharp(input).metadata()
  const maxSize = Math.min(meta.width, meta.height)
  const size = Math.min(crop.size, maxSize)
  const left = Math.max(0, Math.min(crop.left, meta.width - size))
  const top = Math.max(0, Math.min(crop.top, meta.height - size))

  const square = await sharp(input)
    .extract({ left, top, width: size, height: size })
    .webp({ quality: 90, effort: 5 })
    .toBuffer()

  await sharp(square).toFile(input)
  console.log(`${crop.file}: ${meta.width}x${meta.height} -> ${size}x${size} @ ${left},${top}`)
}
