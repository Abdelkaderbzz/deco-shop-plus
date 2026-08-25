// Export HTML mockup pages to PNG for agency portfolio use.
import { chromium } from 'playwright'
import { join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'portfolio-mockups')

const exports = [
  { html: 'janna-style-01-cover.html', out: '01-etude-de-cas-story.png', width: 1080, height: 1920 },
  { html: 'janna-style-02-mobile.html', out: '02-boutique-poche-story.png', width: 1080, height: 1920 },
  { html: 'janna-style-03-agence.html', out: '03-ecommerce-pret-story.png', width: 1080, height: 1920 },
  { html: 'janna-style-04-devices.html', out: '04-web-mobile-story.png', width: 1080, height: 1920 },
]

const browser = await chromium.launch()
for (const item of exports) {
  const page = await browser.newPage({
    viewport: { width: item.width, height: item.height },
    deviceScaleFactor: 2,
  })
  const url = pathToFileURL(join(dir, item.html)).href
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  await page.screenshot({ path: join(dir, item.out), type: 'png' })
  console.log('exported', item.out)
  await page.close()
}
await browser.close()
console.log('done')
