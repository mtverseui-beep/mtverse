import { Skeleton } from '@/components/ui/skeleton'

export default function TemplateDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="ds-container py-6 max-w-6xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 mb-6">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>

        {/* Hero grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-10">
          {/* Left: screenshots */}
          <div className="space-y-4">
            <Skeleton className="aspect-[19/9] w-full rounded-2xl" />
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[19/9] w-full rounded-lg" />
              ))}
            </div>
          </div>

          {/* Right: buy box */}
          <div className="ds-card space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
            <div className="flex items-center gap-3 pb-4 border-b">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-2 w-16" />
              </div>
            </div>
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-11 w-full rounded-full" />
            <Skeleton className="h-11 w-full rounded-full" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-9 rounded-full" />
              <Skeleton className="h-9 rounded-full" />
            </div>
            <div className="space-y-3 pt-4 border-t">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-2 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Highlights grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="ds-card space-y-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>

        {/* About */}
        <div className="max-w-4xl mt-12 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  )
}
