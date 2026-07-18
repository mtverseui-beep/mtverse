import { cn } from '@/lib/utils'

export function TemplatesHero3D({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn('absolute inset-0 overflow-hidden bg-background', className)}>
      <div className="ds-line-grid absolute inset-0 opacity-20" />
      <div className="absolute inset-y-0 left-[14%] w-px bg-border/50" />
      <div className="absolute inset-y-0 right-[14%] w-px bg-border/50" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-border" />
    </div>
  )
}
