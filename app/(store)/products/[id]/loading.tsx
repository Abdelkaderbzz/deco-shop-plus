export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="aspect-[3/4] animate-pulse rounded-2xl bg-muted/50" />
        <div className="space-y-4">
          <div className="h-4 w-24 animate-pulse rounded bg-muted/40" />
          <div className="h-8 w-2/3 animate-pulse rounded bg-muted/50" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-muted/40" />
          <div className="h-20 w-full animate-pulse rounded bg-muted/30" />
          <div className="h-12 w-40 animate-pulse rounded-full bg-muted/50" />
        </div>
      </div>
    </div>
  )
}
