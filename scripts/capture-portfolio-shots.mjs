// Captures clean storefront screenshots for agency portfolio mockups.
import { chromium } from 'playwright'
import { mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'assets', 'portfolio-mockups')
mkdirSync(out, { recursive: true })

const base = process.env.SITE_URL?.replace(/\/$/, '') || 'http://localhost:3001'

const shots = [
  { name: '01-home-desktop', url: '/', width: 1440, height: 900 },
  { name: '02-product-desktop', url: '/products/coussin-decoratif', width: 1440, height: 900 },
  { name: '03-boutique-desktop', url: '/products', width: 1440, height: 900 },
  { name: '04-home-mobile', url: '/', width: 390, height: 844 },
  { name: '05-product-mobile', url: '/products/coussin-decoratif', width: 390, height: 844 },
]

async function clean(page) {
  await page.evaluate(() => {
    window.scrollTo(0, 0)
    document.querySelector('[aria-label="Fermer l\'annonce"]')?.click()
    const style = document.createElement('style')
    style.textContent = `
      nextjs-portal,
      [data-nextjs-toast],
      [data-nextjs-dialog-overlay],
      a[aria-label*="WhatsApp"] { display: none !important; }
    `
    document.head.appendChild(style)
  })
  await page.waitForTimeout(300)
}

const browser = await chromium.launch()
for (const shot of shots) {
  const page = await browser.newPage({
    viewport: { width: shot.width, height: shot.height },
    deviceScaleFactor: 2,
  })
  await page.goto(`${base}${shot.url}`, { waitUntil: 'networkidle', timeout: 60000 })
  await clean(page)
  const path = join(out, `${shot.name}.png`)
  await page.screenshot({ path, type: 'png' })
  console.log('saved', path)
  await page.close()
}
await browser.close()
console.log('done')
