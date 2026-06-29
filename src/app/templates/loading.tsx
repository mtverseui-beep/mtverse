import { Skeleton } from '@/components/ui/skeleton'

export default function TemplatesLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero skeleton */}
      <section className="ds-section-lg ds-bg-section relative overflow-hidden">
        <div className="ds-container relative">
          <div className="max-w-3xl space-y-4">
            <Skeleton className="h-6 w-40 rounded-full" />
            <Skeleton className="h-12 w-3/4 rounded-lg" />
            <Skeleton className="h-12 w-2/3 rounded-lg" />
            <Skeleton className="h-5 w-full max-w-md rounded" />
            <Skeleton className="h-5 w-3/4 max-w-sm rounded" />
            <div className="flex gap-6 pt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-10 w-16" />
                  <Skeleton className="h-3 w-20 mt-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filters + grid skeleton */}
      <section className="ds-section-sm pt-0">
        <div className="ds-container">
          {/* Search + sort */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Skeleton className="h-11 flex-1 rounded-md" />
            <Skeleton className="h-11 w-44 rounded-md" />
          </div>
          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-full" />
            ))}
          </div>
          {/* Grid */}
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-lg border border-border/80 bg-card shadow-sm">
                <Skeleton className="aspect-[19/9] w-full rounded-none" />
                <div className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
