'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Download, Eye, ShoppingCart } from 'lucide-react'
import type { Template } from '@/lib/templates-catalog'

type Props = {
  template: Template
  priority?: boolean
}

function getFrameworkShort(template: Template): string {
  if (template.category === 'html') return 'HTML'
  if (template.frameworkLabel?.toLowerCase().includes('next')) return 'Next.js'
  if (template.techStack.some((t) => t.toLowerCase().startsWith('react'))) return 'React'
  return ''
}

export function TemplateCard({ template, priority = false }: Props) {
  const frameworkLabel = getFrameworkShort(template)
  const showProBadge = !template.isFree && template.pricingTier === 'pro'

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

        {/* Card body — compact */}
        <div className="px-3 pb-3 pt-2.5">
          {/* Title + price — single line */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary-600 dark:group-hover:text-primary-300">
              {template.title}
            </h3>
            <div className="flex shrink-0 items-center gap-2">
              {showProBadge ? (
                <span className="rounded-full border border-amber-300/80 bg-gradient-to-r from-amber-100 via-orange-50 to-rose-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-amber-900 shadow-sm dark:border-amber-500/30 dark:from-amber-500/20 dark:via-orange-500/10 dark:to-rose-500/20 dark:text-amber-200">
                  Pro
                </span>
              ) : null}
              {template.isFree ? (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  Free
                </span>
              ) : (
                <span className="text-sm font-bold text-foreground">${template.price}</span>
              )}
            </div>
          </div>

          {/* Meta row — downloads/purchases left, framework right */}
          <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              {template.isFree ? <Download className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
              {template.salesCount.toLocaleString()} {template.isFree ? 'Downloads' : 'Purchases'}
            </span>
            {frameworkLabel && (
              <span className="font-medium">{frameworkLabel}</span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
