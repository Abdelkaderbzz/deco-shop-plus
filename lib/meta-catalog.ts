import { productHref } from '@/lib/catalog-href'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { absoluteImageUrl } from '@/lib/seo'
import { SITE } from '@/lib/site'
import { absoluteUrl } from '@/lib/site-url'
import { parsePrice } from '@/lib/product-price'
import { lowestSizePrice, parseProductSizes } from '@/lib/product-sizes'
import { eq } from 'drizzle-orm'

const CSV_HEADERS = [
  'id',
  'title',
  'description',
  'availability',
  'condition',
  'price',
  'link',
  'image_link',
  'brand',
]

function csvCell(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function catalogPriceLabel(product: {
  price: string
  sizes: string
}) {
  const base = parsePrice(product.price) ?? 0
  const sizes = parseProductSizes(product.sizes, base)
  const amount = lowestSizePrice(sizes, base) || base
  return `${amount.toFixed(2)} TND`
}

function catalogDescription(description: string | null, name: string) {
  const text = (description ?? name).replace(/\s+/g, ' ').trim()
  return text.length > 5000 ? `${text.slice(0, 4997)}...` : text
}

export async function buildMetaCatalogCsv() {
  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      brand: products.brand,
      description: products.description,
      price: products.price,
      sizes: products.sizes,
      imageUrl: products.imageUrl,
      inStock: products.inStock,
    })
    .from(products)
    .where(eq(products.published, true))
    .orderBy(products.id)

  const lines = [CSV_HEADERS.join(',')]

  for (const product of rows) {
    const imageUrl = product.imageUrl ? absoluteImageUrl(product.imageUrl) : ''
    if (!imageUrl.startsWith('https://')) continue

    const line = [
      String(product.id),
      product.name,
      catalogDescription(product.description, product.name),
      product.inStock ? 'in stock' : 'out of stock',
      'new',
      catalogPriceLabel(product),
      absoluteUrl(productHref(product)),
      imageUrl,
      product.brand || SITE.name,
    ].map((cell) => csvCell(cell))

    lines.push(line.join(','))
  }

  return lines.join('\n')
}
