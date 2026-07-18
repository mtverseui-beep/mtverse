import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export type TemplateFaqItem = {
  question: string
  answer: string
}

export function TemplateFaqList({ items, className }: { items: TemplateFaqItem[]; className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item) => (
        <details key={item.question} className="ds-card group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-foreground">
            <span>{item.question}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
          </summary>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">{item.answer}</p>
        </details>
      ))}
    </div>
  )
}