import type { Metadata } from 'next'
import { catalogHref, productHref } from '@/lib/catalog-href'
import { DEFAULT_DELIVERY_FEE, DELIVERY_COUNTRY, DELIVERY_CURRENCY } from '@/lib/delivery'
import { parseProductBundles } from '@/lib/product-bundles'
import { parseProductColors } from '@/lib/product-colors'
import { parseProductImages } from '@/lib/product-images'
import { parsePrice } from '@/lib/product-price'
import { hasVariableSizePrices, parseProductSizes, uniqueDimensionLabel } from '@/lib/product-sizes'
import { PRODUCT_FABRIC, SITE, STORE_FAQS, STORE_RETURN_DAYS } from '@/lib/site'
import type { Dictionary } from '@/lib/i18n/dictionary'
import { DEFAULT_LOCALE, LOCALE_META, type Locale } from '@/lib/i18n/config'
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
      'ar-TN': path,
      ar: path,
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

function clipMeta(text: string, max = 158) {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max - 1).trimEnd()}…`
}

export function productMetaDescription(
  product: {
    name: string
    description?: string | null
  },
  locale: Locale = 'fr',
) {
  const location = `${SITE.neighborhood}, ${SITE.city}`
  const body = product.description?.trim()
  if (locale === 'ar') {
    if (body) {
      return clipMeta(`${body} مخمل مقاوم للبقع. التوصيل في كامل تونس. ${SITE.name}، حي الواحة، بنزرت.`)
    }
    return clipMeta(
      `${product.name} بمخمل مقاوم للبقع عند ${SITE.name} في حي الواحة، بنزرت. الدفع عند الاستلام، التوصيل في كامل تونس.`,
    )
  }
  if (body) {
    return clipMeta(
      `${body} ${PRODUCT_FABRIC}. Livraison en Tunisie. ${SITE.name}, ${location}.`,
    )
  }
  return clipMeta(
    `${product.name} en ${PRODUCT_FABRIC} chez ${SITE.name} à ${location}. Paiement à la livraison, partout en Tunisie.`,
  )
}

function merchantReturnPolicy() {
  return {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: DELIVERY_COUNTRY,
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: STORE_RETURN_DAYS,
    returnMethod: 'https://schema.org/ReturnInStore',
    returnFees: 'https://schema.org/ReturnShippingFees',
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
    deliveryTime: {
      '@type': 'ShippingDeliveryTime',
      handlingTime: {
        '@type': 'QuantitativeValue',
        minValue: 0,
        maxValue: 2,
        unitCode: 'DAY',
      },
      transitTime: {
        '@type': 'QuantitativeValue',
        minValue: 1,
        maxValue: 5,
        unitCode: 'DAY',
      },
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
    hasMerchantReturnPolicy: merchantReturnPolicy(),
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
  products: { id: number; name: string; slug?: string | null }[]
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
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: absoluteUrl(productHref(product)),
        name: product.name,
      })),
    },
  }
}

export function homePageJsonLd(dict?: Dictionary, locale: 'ar' | 'fr' = DEFAULT_LOCALE) {
  const title = dict
    ? dict.home.title(SITE.name, dict.site.neighborhood, dict.site.city)
    : `${SITE.name} | Décoration à ${SITE.neighborhood}, ${SITE.city}`
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${getSiteUrl()}/#webpage`,
    url: getSiteUrl(),
    name: title,
    description: dict?.site.description ?? SITE.description,
    inLanguage: LOCALE_META[locale].htmlLang,
    isPartOf: { '@id': websiteId() },
    about: { '@id': localBusinessId() },
    primaryImageOfPage: logoImage(),
  }
}

export function faqJsonLd(dict?: Dictionary) {
  const items = dict?.faq.items ?? STORE_FAQS
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
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
  bundles?: string | null
  slug?: string | null
  inStock: boolean
  category: string
  sizes?: string | null
}, locale: Locale = 'fr') {
  const fallback = parsePrice(product.price)
  const sizes = parseProductSizes(product.sizes, fallback ?? 0)
  const dimension = uniqueDimensionLabel(sizes)
  const colors = parseProductColors(product)
  const bundles = parseProductBundles(product)
  const gallery = parseProductImages(product).map(absoluteImageUrl)
  const variable = hasVariableSizePrices(sizes)
  const sizePrices = variable ? sizes.map((size) => size.price) : fallback != null ? [fallback] : []
  const bundlePrices = bundles.map((bundle) => bundle.price)
  const allPrices = [...sizePrices, ...bundlePrices]
  const low = allPrices.length > 0 ? Math.min(...allPrices) : fallback
  const high = allPrices.length > 0 ? Math.max(...allPrices) : fallback
  const offerCount = Math.max(1, sizes.length, bundles.length)
  const image =
    gallery.length > 0 ? gallery : [absoluteUrl('/assets/deco-shop-logo.webp')]
  const availability = product.inStock
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock'
  const offerUrl = absoluteUrl(productHref(product))
  const validUntil = priceValidUntil()
  const compareAt = parsePrice(product.compareAtPrice)

  const offerBase = {
    url: offerUrl,
    priceCurrency: DELIVERY_CURRENCY,
    availability,
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@id': localBusinessId() },
    shippingDetails: offerShippingDetails(),
    hasMerchantReturnPolicy: merchantReturnPolicy(),
    priceValidUntil: validUntil,
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${offerUrl}#product`,
    name: product.name,
    description: productMetaDescription(product, locale),
    sku: String(product.id),
    mpn: String(product.id),
    url: offerUrl,
    image,
    material: PRODUCT_FABRIC,
    countryOfOrigin: {
      '@type': 'Country',
      name: 'Tunisia',
    },
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
      ...(dimension
        ? [
            {
              '@type': 'PropertyValue' as const,
              name: 'Dimensions',
              value: dimension,
            },
          ]
        : []),
      ...sizes.map((size) => ({
        '@type': 'PropertyValue',
        name: 'Taille',
        value: variable ? `${size.name} (${size.price.toFixed(3)} TND)` : size.name,
      })),
      ...bundles.map((bundle) => ({
        '@type': 'PropertyValue',
        name: 'Pack',
        value: `${bundle.name} (${bundle.price.toFixed(3)} TND)`,
      })),
    ],
    offers:
      variable || bundles.length > 0
      ? {
          '@type': 'AggregateOffer',
          ...offerBase,
          lowPrice: low != null ? low.toFixed(3) : undefined,
          highPrice: high != null ? high.toFixed(3) : undefined,
          offerCount,
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
