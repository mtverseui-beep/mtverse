import { Skeleton } from '@/components/ui/skeleton'

export default function PromptDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="ds-container py-6 max-w-5xl">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-1.5 mb-4">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8">
          {/* Main column */}
          <div className="space-y-6">
            {/* Preview image */}
            <Skeleton className="aspect-video w-full rounded-2xl" />
            {/* Title */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-9 w-3/4" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-5/6" />
            </div>
            {/* Prompt panel */}
            <div className="rounded-2xl border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
              <Skeleton className="h-32 w-full" />
            </div>
            {/* About */}
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            {/* Best for */}
            <div className="space-y-2">
              <Skeleton className="h-6 w-24" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl border bg-card p-4 space-y-3">
              <Skeleton className="h-5 w-24" />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-2 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border bg-card p-4 space-y-3">
              <Skeleton className="h-5 w-16" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-16 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
