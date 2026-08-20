import { HeroSkeleton, ProductGridSkeleton } from '@/components/store-skeletons'

export default function HomeLoading() {
  return (
    <div>
      <HeroSkeleton />
      <ProductGridSkeleton count={4} />
    </div>
  )
}
