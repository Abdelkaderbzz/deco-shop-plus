// Export each catalog product's default image as Facebook Story size (1080×1920).
// Run: node scripts/export-facebook-stories.mjs
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'facebook-stories')

const STORY_WIDTH = 1080
const STORY_HEIGHT = 1920
/** Product image width inside the story frame (keeps marketing square readable). */
const PRODUCT_WIDTH = 1000

function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)
}

/** Pull IMG map + product name/image pairs from seed without connecting to the DB. */
async function loadCatalogDefaults() {
  const seed = await readFile(path.join(root, 'scripts', 'seed-products.mjs'), 'utf8')
  const imgBlock = seed.match(/const IMG = \{([\s\S]*?)\n\}/)?.[1]
  if (!imgBlock) throw new Error('Could not parse IMG map from seed-products.mjs')

  /** @type {Record<string, string>} */
  const IMG = Object.fromEntries(
    [...imgBlock.matchAll(/(\w+):\s*'([^']+)'/g)].map((m) => [m[1], m[2]]),
  )

  const products = [
    ...seed.matchAll(
      /key:\s*'([^']+)',\s*\n\s*name:\s*'((?:\\'|[^'])*)'[\s\S]*?\n\s*image:\s*IMG\.(\w+)/g,
    ),
  ].map((m) => {
    const key = m[1]
    const name = m[2].replace(/\\'/g, "'")
    const imgKey = m[3]
    const image = IMG[imgKey]
    if (!image) throw new Error(`Missing IMG.${imgKey} for product ${key}`)
    return { key, name, image }
  })

  if (products.length === 0) throw new Error('No products found in seed-products.mjs')
  return products
}

async function toStory(srcPath, destPath) {
  const productBuf = await sharp(srcPath)
    .rotate()
    .resize(PRODUCT_WIDTH, PRODUCT_WIDTH, { fit: 'inside', withoutEnlargement: false })
    .png()
    .toBuffer()

  const productMeta = await sharp(productBuf).metadata()
  const pw = productMeta.width ?? PRODUCT_WIDTH
  const ph = productMeta.height ?? PRODUCT_WIDTH
  const left = Math.round((STORY_WIDTH - pw) / 2)
  const top = Math.round((STORY_HEIGHT - ph) / 2)

  const background = await sharp(srcPath)
    .rotate()
    .resize(STORY_WIDTH, STORY_HEIGHT, { fit: 'cover', position: 'centre' })
    .blur(28)
    .modulate({ brightness: 0.72, saturation: 0.85 })
    .jpeg({ quality: 85 })
    .toBuffer()

  await sharp(background)
    .composite([{ input: productBuf, left, top }])
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(destPath)
}

async function run() {
  const products = await loadCatalogDefaults()
  await mkdir(outDir, { recursive: true })

  const manifest = []
  for (const product of products) {
    const srcPath = path.join(root, 'public', product.image.replace(/^\//, ''))
    const slug = slugify(product.name) || product.key
    const fileName = `${slug}.jpg`
    const destPath = path.join(outDir, fileName)

    await toStory(srcPath, destPath)
    const meta = await sharp(destPath).metadata()
    console.log(`${product.name} → ${fileName} (${meta.width}×${meta.height})`)
    manifest.push({
      key: product.key,
      name: product.name,
      file: fileName,
      source: product.image,
      size: `${meta.width}x${meta.height}`,
    })
  }

  await writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
  console.log(`\n✓ ${manifest.length} Facebook Story images → ${path.relative(root, outDir)}/`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
