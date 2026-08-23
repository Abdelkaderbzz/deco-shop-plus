import { getCategories } from '@/app/actions/categories'
import { getStoreProductsPaginated } from '@/app/actions/products'
import { JsonLd } from '@/components/json-ld'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { CategoryPhotos } from '@/components/category-photos'
import { ProductCard } from '@/components/product-card'
import { CatalogToolbar } from './catalog-toolbar'
import { catalogHref } from '@/lib/catalog-href'
import { breadcrumbJsonLd, collectionPageJsonLd } from '@/lib/seo'
import { SITE } from '@/lib/site'
import { mergeStoreCategories } from '@/lib/store-categories'
import { STORE_PAGE_SIZE } from '@/lib/pagination'
import Link from 'next/link'

export async function CatalogPage({
  category,
  search,
  page,
}: {
  category: string
  search: string
  page: number
}) {
  const [productPage, categories] = await Promise.all([
    getStoreProductsPaginated({
      page,
      pageSize: STORE_PAGE_SIZE,
      search,
      category,
    }),
    getCategories(),
  ])
  const storeCategories = mergeStoreCategories(categories)
  const selected = storeCategories.find((item) => item.slug === category)
  const name = selected ? `${selected.name} | ${SITE.name}` : `Boutique | ${SITE.name}`
  const description = selected
    ? `${selected.name} en velours anti-tache chez ${SITE.name} à ${SITE.neighborhood}, ${SITE.city}. ${selected.tagline}.`
    : SITE.description
  const path = catalogHref({ category, search, page: search ? page : 1 })
  const crumbs = selected
    ? [
        { name: 'Accueil', path: '/' },
        { name: 'Boutique', path: '/products' },
        { name: selected.name, path: catalogHref({ category: selected.slug }) },
      ]
    : [
        { name: 'Accueil', path: '/' },
        { name: 'Boutique', path: '/products' },
      ]
  const labels = storeCategories.map((item) => ({ slug: item.slug, name: item.name }))

  return (
    <>
      <JsonLd
        data={collectionPageJsonLd({
          name,
          description,
          path,
          products: productPage.items.map((product) => ({
            id: product.id,
            slug: product.slug,
            name: product.name,
          })),
        })}
      />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs
        items={crumbs.map((item, index) => ({
          name: item.name,
          href: index === crumbs.length - 1 ? undefined : item.path,
        }))}
      />
      <CategoryPhotos category={category} categories={storeCategories} />
      <CatalogToolbar search={search} category={category} storeCategories={storeCategories} />

      {productPage.total === 0 ? (
        category !== 'all' && selected ? (
          <p className="py-8 text-center text-sm font-light tracking-widest text-muted-foreground">
            Produits bientot disponibles dans cette categorie
          </p>
        ) : (
          <div className="py-24 text-center">
            <p className="text-sm font-light tracking-widest text-muted-foreground">AUCUN PRODUIT TROUVE</p>
          </div>
        )
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {productPage.items.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                categories={labels}
                priority={index < 4}
              />
            ))}
          </div>

          {productPage.totalPages > 1 ? (
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <p className="text-sm font-light text-muted-foreground">
                Page {productPage.page} / {productPage.totalPages} · {productPage.total} produit
                {productPage.total > 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2">
                {productPage.page > 1 ? (
                  <Link
                    href={catalogHref({ search, category, page: productPage.page - 1 })}
                    prefetch={false}
                    className="inline-flex min-h-11 items-center gap-1 rounded-full border border-border px-4 py-2 text-xs font-light tracking-widest text-muted-foreground"
                  >
                    Precedent
                  </Link>
                ) : (
                  <span className="inline-flex min-h-11 cursor-not-allowed items-center gap-1 rounded-full border border-border px-4 py-2 text-xs font-light tracking-widest text-muted-foreground opacity-40">
                    Precedent
                  </span>
                )}
                {productPage.page < productPage.totalPages ? (
                  <Link
                    href={catalogHref({ search, category, page: productPage.page + 1 })}
                    prefetch={false}
                    className="inline-flex min-h-11 items-center gap-1 rounded-full border border-border px-4 py-2 text-xs font-light tracking-widest text-muted-foreground"
                  >
                    Suivant
                  </Link>
                ) : (
                  <span className="inline-flex min-h-11 cursor-not-allowed items-center gap-1 rounded-full border border-border px-4 py-2 text-xs font-light tracking-widest text-muted-foreground opacity-40">
                    Suivant
                  </span>
                )}
              </div>
            </div>
          ) : null}
        </>
      )}
    </>
  )
}

