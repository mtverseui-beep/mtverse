import { PromptGridSkeleton } from '@/components/ui/skeletons'

export default function PromptsLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero skeleton */}
      <section className="ds-section-lg ds-bg-section relative overflow-hidden">
        <div className="ds-container relative">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <div className="mx-auto h-6 w-32 rounded-full bg-muted animate-pulse" />
            <div className="mx-auto h-12 w-3/4 rounded-lg bg-muted animate-pulse" />
            <div className="mx-auto h-12 w-2/3 rounded-lg bg-muted animate-pulse" />
            <div className="mx-auto h-5 w-full max-w-md rounded bg-muted animate-pulse" />
            <div className="mx-auto h-5 w-3/4 max-w-sm rounded bg-muted animate-pulse" />
            <div className="mx-auto h-12 w-full max-w-md rounded-full bg-muted animate-pulse" />
            {/* Filter chips skeleton */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-8 w-20 rounded-full bg-muted animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Grid skeleton */}
      <section className="ds-section-sm">
        <div className="ds-container">
          <PromptGridSkeleton count={12} />
        </div>
      </section>
    </div>
  )
}
