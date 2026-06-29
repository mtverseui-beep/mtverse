import { Skeleton } from '@/components/ui/skeleton'

export default function AdminPromptsLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-32 rounded-full" />
      </div>

      {/* Filters skeleton */}
      <div className="flex gap-3">
        <Skeleton className="h-11 flex-1 rounded-md" />
        <Skeleton className="h-11 w-48 rounded-md" />
        <Skeleton className="h-11 w-32 rounded-full" />
      </div>

      {/* Table skeleton */}
      <div className="ds-card p-0 overflow-hidden">
        <div className="space-y-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 border-b">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-48" />
                <Skeleton className="h-2 w-32" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full hidden md:block" />
              <div className="flex gap-1">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
