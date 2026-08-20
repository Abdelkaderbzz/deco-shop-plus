import { productHref } from '@/lib/catalog-href'
import { parsePrice } from '@/lib/product-price'
import { hasVariableSizePrices, lowestSizePrice, parseProductSizes } from '@/lib/product-sizes'
import { SITE } from '@/lib/site'
import { FACEBOOK_URL } from '@/lib/social-links'
import { absoluteUrl, getSiteUrl } from '@/lib/site-url'

function orgId() {
  return `${getSiteUrl()}/#organization`
}

function websiteId() {
  return `${getSiteUrl()}/#website`
}

function localBusinessId() {
  return `${getSiteUrl()}/#localbusiness`
}

export function organizationJsonLd() {
  return {
    '@type': 'Organization',
    '@id': orgId(),
    name: SITE.name,
    url: getSiteUrl(),
    logo: absoluteUrl('/assets/deco-shop-logo.webp'),
    sameAs: [FACEBOOK_URL],
    telephone: SITE.phoneTel,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.neighborhood,
      addressLocality: SITE.city,
      addressRegion: SITE.region,
      addressCountry: 'TN',
    },
  }
}

export function localBusinessJsonLd() {
  return {
    '@type': 'HomeGoodsStore',
    '@id': localBusinessId(),
    name: SITE.name,
    image: absoluteUrl('/assets/deco-shop-logo.webp'),
    url: getSiteUrl(),
    telephone: SITE.phoneTel,
    priceRange: '$$',
    currenciesAccepted: 'TND',
    paymentAccepted: 'Cash, Cash on delivery',
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.neighborhood,
      addressLocality: SITE.city,
      addressRegion: SITE.region,
      addressCountry: 'TN',
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: SITE.region,
    },
    sameAs: [FACEBOOK_URL],
    parentOrganization: { '@id': orgId() },
  }
}

export function websiteJsonLd() {
  return {
    '@type': 'WebSite',
    '@id': websiteId(),
    url: getSiteUrl(),
    name: SITE.name,
    inLanguage: 'fr-TN',
    publisher: { '@id': orgId() },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${getSiteUrl()}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function storeGraphJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [organizationJsonLd(), localBusinessJsonLd(), websiteJsonLd()],
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function collectionPageJsonLd({
  name,
  description,
  path,
  products,
}: {
  name: string
  description: string
  path: string
  products: { id: number; name: string }[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: absoluteUrl(path),
    isPartOf: { '@id': websiteId() },
    about: { '@id': localBusinessId() },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: absoluteUrl(productHref(product.id)),
        name: product.name,
      })),
    },
  }
}

export function productJsonLd(product: {
  id: number
  name: string
  brand: string
  description: string | null
  price: string
  imageUrl: string | null
  inStock: boolean
  category: string
  sizes?: string | null
}) {
  const fallback = parsePrice(product.price)
  const sizes = parseProductSizes(product.sizes, fallback ?? 0)
  const variable = hasVariableSizePrices(sizes)
  const low = variable ? lowestSizePrice(sizes, fallback ?? 0) : fallback
  const high = variable ? Math.max(...sizes.map((size) => size.price)) : fallback
  const image = product.imageUrl
    ? product.imageUrl.startsWith('http')
      ? product.imageUrl
      : absoluteUrl(product.imageUrl)
    : absoluteUrl('/assets/deco-shop-logo.webp')

  const availability = product.inStock
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock'
  const offerUrl = absoluteUrl(productHref(product.id))

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} chez ${SITE.name} à ${SITE.city}.`,
    sku: String(product.id),
    image,
    brand: {
      '@type': 'Brand',
      name: product.brand || SITE.name,
    },
    category: product.category,
    offers: variable
      ? {
          '@type': 'AggregateOffer',
          url: offerUrl,
          priceCurrency: 'TND',
          lowPrice: low != null ? low.toFixed(3) : undefined,
          highPrice: high != null ? high.toFixed(3) : undefined,
          offerCount: sizes.length,
          availability,
          itemCondition: 'https://schema.org/NewCondition',
          seller: { '@id': localBusinessId() },
        }
      : {
          '@type': 'Offer',
          url: offerUrl,
          priceCurrency: 'TND',
          price: fallback != null ? fallback.toFixed(3) : undefined,
          availability,
          itemCondition: 'https://schema.org/NewCondition',
          seller: { '@id': localBusinessId() },
        },
  }
}

