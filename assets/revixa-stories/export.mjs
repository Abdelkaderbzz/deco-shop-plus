import { createServer } from 'node:http'
import { readFile, mkdir } from 'node:fs/promises'
import { extname, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const here = dirname(fileURLToPath(import.meta.url))
const assets = join(here, '..')
const outDir = here

const stories = [
  '01-projet-livre.html',
  '02-boutique-ouverte.html',
  '03-cle-en-main.html',
  '04-client-satisfait.html',
  '05-a-votre-tour.html',
]

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
}

const server = createServer(async (req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0])
  const file = join(assets, url)
  try {
    const data = await readFile(file)
    res.writeHead(200, {
      'Content-Type': mime[extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    })
    res.end(data)
  } catch {
    res.writeHead(404)
    res.end()
  }
})

await mkdir(outDir, { recursive: true })

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const { port } = server.address()
const origin = `http://127.0.0.1:${port}`

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 1080, height: 1920 },
  deviceScaleFactor: 1,
})

try {
  for (const file of stories) {
    const url = `${origin}/revixa-stories/${file}`
    await page.goto(url, { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(400)
    const png = file.replace(/\.html$/, '.png')
    await page.locator('.stage').screenshot({ path: join(outDir, png), type: 'png' })
    console.log('exported', png)
  }
} finally {
  await browser.close()
  server.close()
}
