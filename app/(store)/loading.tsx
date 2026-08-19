export default function HomeLoading() {
  return (
    <div>
      <div className="mx-auto max-w-7xl px-2 py-4 sm:px-3 md:py-5">
        <div className="min-h-[56vh] animate-pulse rounded-2xl bg-muted/60 md:min-h-[64vh]" />
      </div>
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-2 py-10 sm:px-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="aspect-[4/5] animate-pulse rounded-2xl bg-muted/50" />
        ))}
      </div>
    </div>
  )
}
