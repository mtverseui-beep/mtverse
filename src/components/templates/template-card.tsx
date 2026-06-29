'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import type { Template } from '@/lib/templates-catalog'

type Props = {
  template: Template
  priority?: boolean
}

export function TemplateCard({ template, priority = false }: Props) {
  return (
    <Link href={`/templates/${template.slug}`} className="group block h-full no-underline">
      <article className="h-full overflow-hidden rounded-lg border border-border/80 bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md">
        <div className="border-b border-border/70 bg-muted/35 p-2">
          <div className="overflow-hidden rounded-md border border-border/70 bg-background">
            <Image
              src={template.screenshotUrl}
              alt={template.title}
              width={1900}
              height={900}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="block h-auto w-full object-contain transition-transform duration-500 group-hover:scale-[1.012]"
              priority={priority}
              unoptimized
            />
          </div>
        </div>

        <div className="p-4">
          <div className="flex min-h-[2.75rem] items-start justify-between gap-3">
            <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary-600 dark:group-hover:text-primary-300">
              {template.title}
            </h3>
            <span className="shrink-0 text-lg font-semibold text-foreground">${template.price}</span>
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <ShoppingCart className="h-4 w-4" />
            <span>{template.salesCount.toLocaleString()} Purchases</span>
          </div>
        </div>
      </article>
    </Link>
  )
}