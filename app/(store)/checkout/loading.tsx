export default function CheckoutLoading() {
  return (
    <div className="mx-auto max-w-3xl px-2 py-10 sm:px-3">
      <div className="mb-6 h-8 w-40 animate-pulse rounded bg-muted/50" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex gap-4">
            <div className="size-20 animate-pulse rounded-md bg-muted/50" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted/40" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-muted/40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
