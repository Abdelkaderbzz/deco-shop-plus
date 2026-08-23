import type { Metadata } from 'next'
import { catalogHref, productHref } from '@/lib/catalog-href'
import { DEFAULT_DELIVERY_FEE, DELIVERY_COUNTRY, DELIVERY_CURRENCY } from '@/lib/delivery'
import { parseProductColors } from '@/lib/product-colors'
import { parseProductImages } from '@/lib/product-images'
import { parsePrice } from '@/lib/product-price'
import { hasVariableSizePrices, lowestSizePrice, parseProductSizes } from '@/lib/product-sizes'
import { PRODUCT_FABRIC, SITE } from '@/lib/site'
import { FACEBOOK_URL, MAPS_URL, WHATSAPP_URL } from '@/lib/social-links'
import { STORE_CATEGORIES } from '@/lib/store-categories'
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

export function absoluteImageUrl(url: string) {
  return url.startsWith('http') ? url : absoluteUrl(url)
}

export function ogRemoteImage(url?: string | null) {
  if (!url) return null
  const absolute = absoluteImageUrl(url)
  return absolute.startsWith('https://') ? absolute : null
}

export function pageAlternates(path: string): NonNullable<Metadata['alternates']> {
  return {
    canonical: path,
    languages: {
      'fr-TN': path,
      fr: path,
      'x-default': path,
    },
  }
}

function contactPoint() {
  return {
    '@type': 'ContactPoint',
    telephone: SITE.phoneTel,
    contactType: 'customer service',
    areaServed: DELIVERY_COUNTRY,
    availableLanguage: ['French', 'Arabic'],
    url: WHATSAPP_URL,
  }
}

function postalAddress() {
  return {
    '@type': 'PostalAddress',
    streetAddress: SITE.neighborhood,
    addressLocality: SITE.city,
    addressRegion: SITE.region,
    addressCountry: 'TN',
  }
}

function logoImage() {
  return {
    '@type': 'ImageObject',
    url: absoluteUrl('/assets/deco-shop-logo.webp'),
  }
}

function offerShippingDetails() {
  return {
    '@type': 'OfferShippingDetails',
    shippingDestination: {
      '@type': 'DefinedRegion',
      addressCountry: DELIVERY_COUNTRY,
    },
    shippingRate: {
      '@type': 'MonetaryAmount',
      value: DEFAULT_DELIVERY_FEE,
      currency: DELIVERY_CURRENCY,
    },
  }
}

function priceValidUntil() {
  const until = new Date()
  until.setFullYear(until.getFullYear() + 1)
  return until.toISOString().slice(0, 10)
}

export function organizationJsonLd() {
  return {
    '@type': 'Organization',
    '@id': orgId(),
    name: SITE.name,
    alternateName: SITE.shortName,
    url: getSiteUrl(),
    logo: logoImage(),
    image: logoImage(),
    sameAs: [FACEBOOK_URL],
    telephone: SITE.phoneTel,
    address: postalAddress(),
    contactPoint: contactPoint(),
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
    currenciesAccepted: DELIVERY_CURRENCY,
    paymentAccepted: 'Cash, Cash on delivery',
    address: postalAddress(),
    hasMap: MAPS_URL,
    contactPoint: contactPoint(),
    areaServed: [
      { '@type': 'City', name: SITE.city },
      { '@type': 'Country', name: 'Tunisia' },
    ],
    knowsLanguage: ['fr', 'ar'],
    sameAs: [FACEBOOK_URL],
    parentOrganization: { '@id': orgId() },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `Boutique ${SITE.name}`,
      itemListElement: STORE_CATEGORIES.map((category) => ({
        '@type': 'OfferCatalog',
        name: category.name,
        url: absoluteUrl(catalogHref({ category: category.slug })),
      })),
    },
  }
}

export function websiteJsonLd() {
  return {
    '@type': 'WebSite',
    '@id': websiteId(),
    url: getSiteUrl(),
    name: SITE.name,
    alternateName: `${SITE.name} ${SITE.city}`,
    description: SITE.description,
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
  const url = absoluteUrl(path)
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#webpage`,
    name,
    description,
    url,
    inLanguage: 'fr-TN',
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
  compareAtPrice?: string | null
  imageUrl: string | null
  images?: string | null
  colors?: string | null
  inStock: boolean
  category: string
  sizes?: string | null
}) {
  const fallback = parsePrice(product.price)
  const sizes = parseProductSizes(product.sizes, fallback ?? 0)
  const colors = parseProductColors(product)
  const gallery = parseProductImages(product).map(absoluteImageUrl)
  const variable = hasVariableSizePrices(sizes)
  const low = variable ? lowestSizePrice(sizes, fallback ?? 0) : fallback
  const high = variable ? Math.max(...sizes.map((size) => size.price)) : fallback
  const image =
    gallery.length > 0 ? gallery : [absoluteUrl('/assets/deco-shop-logo.webp')]
  const availability = product.inStock
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock'
  const offerUrl = absoluteUrl(productHref(product.id))
  const validUntil = priceValidUntil()
  const compareAt = parsePrice(product.compareAtPrice)

  const offerBase = {
    url: offerUrl,
    priceCurrency: DELIVERY_CURRENCY,
    availability,
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@id': localBusinessId() },
    shippingDetails: offerShippingDetails(),
    priceValidUntil: validUntil,
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${offerUrl}#product`,
    name: product.name,
    description:
      product.description || `${product.name} chez ${SITE.name} à ${SITE.city}.`,
    sku: String(product.id),
    mpn: String(product.id),
    url: offerUrl,
    image,
    brand: {
      '@type': 'Brand',
      name: product.brand || SITE.name,
    },
    category: product.category,
    color: colors.length > 0 ? colors.map((color) => color.name).join(', ') : undefined,
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Matière de fabrication',
        value: PRODUCT_FABRIC,
      },
      ...sizes.map((size) => ({
        '@type': 'PropertyValue',
        name: 'Taille',
        value: variable ? `${size.name} (${size.price.toFixed(3)} TND)` : size.name,
      })),
    ],
    offers: variable
      ? {
          '@type': 'AggregateOffer',
          ...offerBase,
          lowPrice: low != null ? low.toFixed(3) : undefined,
          highPrice: high != null ? high.toFixed(3) : undefined,
          offerCount: sizes.length,
        }
      : {
          '@type': 'Offer',
          ...offerBase,
          price: fallback != null ? fallback.toFixed(3) : undefined,
          priceSpecification:
            compareAt != null && fallback != null && compareAt > fallback
              ? {
                  '@type': 'UnitPriceSpecification',
                  price: fallback.toFixed(3),
                  priceCurrency: DELIVERY_CURRENCY,
                  referenceQuantity: {
                    '@type': 'QuantitativeValue',
                    value: 1,
                  },
                }
              : undefined,
        },
  }
}
