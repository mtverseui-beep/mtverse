import { Skeleton } from '@/components/ui/skeleton'

/* -----------------------------------------------------------------------
   PromptCardSkeleton
   Skeleton for a single prompt card in a grid layout
   ----------------------------------------------------------------------- */
export function PromptCardSkeleton() {
  return (
    <div className="mv-card overflow-hidden p-0">
      {/* Image placeholder */}
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-24 rounded-full" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-16 rounded-md" />
        </div>
      </div>
    </div>
  )
}

/* -----------------------------------------------------------------------
   PromptGridSkeleton
   Grid of prompt card skeletons
   ----------------------------------------------------------------------- */
export function PromptGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <PromptCardSkeleton key={i} />
      ))}
    </div>
  )
}

/* -----------------------------------------------------------------------
   PricingSkeleton
   Skeleton for the pricing page with plan cards
   ----------------------------------------------------------------------- */
export function PricingSkeleton() {
  return (
    <div>
      {/* Hero skeleton */}
      <section className="page-hero">
        <div className="page-hero-inner page-frame text-center">
          <Skeleton className="mx-auto mb-4 h-4 w-20 rounded-full" />
          <Skeleton className="mx-auto h-10 w-64" />
          <Skeleton className="mx-auto mt-4 h-5 w-80" />
        </div>
      </section>

      {/* Pricing cards skeleton */}
      <section className="premium-section">
        <div className="page-frame">
          <div className="mx-auto max-w-5xl grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="mv-card p-6 space-y-4">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-4 w-full" />
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

/* -----------------------------------------------------------------------
   SearchResultsSkeleton
   Skeleton for search results
   ----------------------------------------------------------------------- */
export function SearchResultsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 rounded-xl p-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3 rounded-full" />
            <Skeleton className="h-3 w-full rounded-full" />
            <Skeleton className="h-3 w-1/3 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* -----------------------------------------------------------------------
   AdminTableSkeleton
   Skeleton for admin table rows
   ----------------------------------------------------------------------- */
export function AdminTableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 border-b border-border pb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

/* -----------------------------------------------------------------------
   PageSkeleton
   Generic full-page skeleton with header + content areas
   ----------------------------------------------------------------------- */
export function PageSkeleton({ hasHero = true }: { hasHero?: boolean }) {
  return (
    <div>
      {hasHero && (
        <section className="page-hero">
          <div className="page-hero-inner page-frame text-center">
            <Skeleton className="mx-auto mb-4 h-4 w-20 rounded-full" />
            <Skeleton className="mx-auto h-10 w-64" />
            <Skeleton className="mx-auto mt-4 h-5 w-80" />
          </div>
        </section>
      )}
      <section className="premium-section">
        <div className="page-frame">
          <div className="mx-auto max-w-3xl space-y-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
            <div className="grid gap-4 sm:grid-cols-2 mt-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="mv-card p-5 space-y-3">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
