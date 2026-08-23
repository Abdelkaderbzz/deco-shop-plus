// Crop existing product photos into wide hero carousel banners.
// Run: node scripts/make-hero-banners.mjs
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const assets = path.join(root, 'public', 'assets')

const WIDTH = 1920
const HEIGHT = 825

/** @type {{ src: string, dest: string, extract?: { left: number, top: number, width: number, height: number }, position: string }[]} */
const BANNERS = [
  {
    src: 'chair-pad-pack-4-table.webp',
    dest: 'banner-galettes.webp',
    // Drop the baked-in "LIVRAISON EN TUNISIE" bar.
    extract: { left: 0, top: 0, width: 1200, height: 1060 },
    position: 'centre',
  },
  {
    src: 'reading-pillow.webp',
    dest: 'banner-lecture.webp',
    position: 'centre',
  },
  {
    src: 'sofa-cushion-colors.webp',
    dest: 'banner-canape.webp',
    position: 'south',
  },
  {
    src: 'headboard-cushion-bed.webp',
    dest: 'banner-tete-de-lit.webp',
    position: 'centre',
  },
]

async function makeBanner(job) {
  const input = sharp(path.join(assets, job.src)).rotate()
  const pipeline = job.extract ? input.extract(job.extract) : input

  await pipeline
    .resize(WIDTH, HEIGHT, { fit: 'cover', position: job.position })
    .webp({ quality: 82, effort: 5 })
    .toFile(path.join(assets, job.dest))

  const meta = await sharp(path.join(assets, job.dest)).metadata()
  const stat = await import('node:fs/promises').then((fs) => fs.stat(path.join(assets, job.dest)))
  console.log(`${job.src} -> ${job.dest} (${meta.width}x${meta.height}, ${(stat.size / 1024).toFixed(0)}KB)`)
}

async function run() {
  for (const job of BANNERS) {
    await makeBanner(job)
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
