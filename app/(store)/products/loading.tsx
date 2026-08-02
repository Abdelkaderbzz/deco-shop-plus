export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 h-40 animate-pulse rounded-2xl bg-muted/60" />
      <div className="mb-8 flex flex-col gap-4 lg:flex-row">
        <div className="h-11 w-full animate-pulse rounded-xl bg-muted/50 lg:w-72" />
        <div className="flex flex-1 flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-9 w-20 animate-pulse rounded-full bg-muted/50" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
