'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

type PackageDownloadButtonProps = {
  href: string
  label?: string
  loadingLabel?: string
  detail?: string
  resetMs?: number
  className?: string
}

export function PackageDownloadButton({
  href,
  label = 'Download package',
  loadingLabel = 'Preparing ZIP...',
  detail,
  resetMs = 12000,
  className,
}: PackageDownloadButtonProps) {
  const [loading, setLoading] = useState(false)

  return (
    <div className={cn('grid gap-2', className)}>
      <a
        href={href}
        className="ds-btn ds-btn-primary w-full"
        onClick={() => {
          setLoading(true)
          window.setTimeout(() => setLoading(false), resetMs)
        }}
        aria-busy={loading}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {loading ? loadingLabel : label}
      </a>

      {loading && detail ? (
        <div className="overflow-hidden rounded-2xl border border-primary/15 bg-primary/5 p-3 text-left">
          <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-primary/10">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
          </div>
          <p className="text-xs font-medium leading-5 text-muted-foreground">{detail}</p>
        </div>
      ) : null}
    </div>
  )
}