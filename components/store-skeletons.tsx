export function HeroSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-2 py-4 sm:px-3 md:py-5">
      <div className="min-h-[56vh] animate-pulse rounded-2xl bg-muted/60 md:min-h-[64vh]" />
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="mx-auto max-w-7xl px-2 py-14 sm:px-3 md:py-16">
      <div className="mx-auto mb-10 h-8 w-48 animate-pulse rounded bg-muted/50" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="space-y-3">
            <div className="aspect-square animate-pulse rounded-md bg-muted/50" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-muted/40" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted/40" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function CategoriesSkeleton() {
  return (
    <section className="border-t border-border bg-secondary/35 py-14 md:py-16">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-2 sm:px-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="aspect-square animate-pulse rounded-2xl bg-muted/50" />
        ))}
      </div>
    </section>
  )
}

export function CatalogSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-2 py-8 sm:px-3">
      <div className="mb-8 h-40 animate-pulse rounded-2xl bg-muted/60" />
      <div className="mb-8 flex flex-col gap-4 lg:flex-row">
        <div className="h-11 w-full animate-pulse rounded-xl bg-muted/50 lg:w-72" />
        <div className="flex flex-1 flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-9 w-20 animate-pulse rounded-full bg-muted/50" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <div className="aspect-[3/4] animate-pulse rounded-xl bg-muted/50" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-muted/40" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted/40" />
          </div>
        ))}
      </div>
    </div>
  )
}
