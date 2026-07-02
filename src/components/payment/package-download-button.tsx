'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

type PackageDownloadButtonProps = {
  href: string
  label?: string
  loadingLabel?: string
}

export function PackageDownloadButton({
  href,
  label = 'Download package',
  loadingLabel = 'Preparing ZIP...',
}: PackageDownloadButtonProps) {
  const [loading, setLoading] = useState(false)

  return (
    <a
      href={href}
      className="ds-btn ds-btn-primary"
      onClick={() => {
        setLoading(true)
        window.setTimeout(() => setLoading(false), 12000)
      }}
      aria-busy={loading}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {loading ? loadingLabel : label}
    </a>
  )
}
