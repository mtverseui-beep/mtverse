'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Eye, ShoppingCart } from 'lucide-react'
import type { Template } from '@/lib/templates-catalog'

type Props = {
  template: Template
  priority?: boolean
}

export function TemplateCard({ template, priority = false }: Props) {
  return (
    <Link href={`/templates/${template.slug}`} className="group block h-full no-underline">
      <article className="relative h-full overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.04]">
        {/* Screenshot container */}
        <div className="relative overflow-hidden bg-gradient-to-br from-muted/60 via-muted/30 to-muted/50 p-3">
          <div className="relative overflow-hidden rounded-xl border border-border/70 bg-background shadow-md shadow-black/[0.04] transition-shadow duration-300 group-hover:shadow-lg group-hover:shadow-primary/[0.06]">
            <Image
              src={template.screenshotUrl}
              alt={template.title}
              width={1900}
              height={900}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="block h-auto w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              priority={priority}
              unoptimized
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-zinc-950/40 via-zinc-950/10 to-zinc-950/5 opacity-0 transition-all duration-300 group-hover:opacity-100">
              <span className="inline-flex translate-y-3 scale-90 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 shadow-2xl ring-1 ring-black/5 transition-all duration-300 group-hover:translate-y-0 group-hover:scale-100 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-white/10">
                <Eye className="h-4 w-4" />
                Live preview
              </span>
            </div>
          </div>
        </div>

        {/* Card body */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary-600 dark:group-hover:text-primary-300 sm:text-base">
              {template.title}
            </h3>
            {template.isFree ? (
              <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                Free
              </span>
            ) : (
              <span className="shrink-0 text-lg font-semibold text-foreground">${template.price}</span>
            )}
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
