'use client'

import { useState } from 'react'
import { AlertCircle, CheckCircle2, Download, Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

type PackageDownloadButtonProps = {
  href: string
  label?: string
  loadingLabel?: string
  detail?: string
  resetMs?: number
  className?: string
}

function filenameFromResponse(response: Response, fallback: string) {
  const disposition = response.headers.get('content-disposition') || ''
  const filenamePart = disposition.split('filename=').pop()?.split(';')[0]?.trim()
  if (!filenamePart) return fallback
  return decodeURIComponent(filenamePart.replaceAll(String.fromCharCode(34), '').replace(/^UTF-8''/i, ''))
}

export function PackageDownloadButton({
  href,
  label = 'Download package',
  loadingLabel = 'Preparing ZIP...',
  detail,
  resetMs = 2500,
  className,
}: PackageDownloadButtonProps) {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [complete, setComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function downloadPackage() {
    if (loading) return

    setLoading(true)
    setProgress(null)
    setComplete(false)
    setError(null)

    try {
      const response = await fetch(href, { credentials: 'include' })
      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string } | null
        throw new Error(payload?.error || 'The package could not be prepared. Please try again.')
      }

      const totalBytes = Number(response.headers.get('content-length') || 0)
      let blob: Blob

      if (response.body) {
        const reader = response.body.getReader()
        const chunks: ArrayBuffer[] = []
        let receivedBytes = 0

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          if (!value) continue

          chunks.push(value.slice().buffer as ArrayBuffer)
          receivedBytes += value.byteLength
          if (totalBytes > 0) {
            setProgress(Math.min(99, Math.round((receivedBytes / totalBytes) * 100)))
          }
        }

        blob = new Blob(chunks, { type: response.headers.get('content-type') || 'application/zip' })
      } else {
        blob = await response.blob()
      }

      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = objectUrl
      anchor.download = filenameFromResponse(response, 'mtverse-template-package.zip')
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(objectUrl)

      setProgress(100)
      setComplete(true)
      window.setTimeout(() => {
        setComplete(false)
        setProgress(null)
      }, resetMs)
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : 'The download failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('grid gap-2', className)}>
      <button
        type='button'
        className={'ds-btn ds-btn-primary w-full disabled:cursor-wait disabled:opacity-80'}
        onClick={downloadPackage}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? <Loader2 className={'h-4 w-4 animate-spin'} /> : complete ? <CheckCircle2 className={'h-4 w-4'} /> : <Download className={'h-4 w-4'} />}
        {loading ? loadingLabel : complete ? 'Download ready' : label}
      </button>

      {loading && detail ? (
        <div className={'overflow-hidden rounded-xl border border-primary/15 bg-primary/5 p-3 text-left'} aria-live='polite'>
          <div className={'mb-2 h-1.5 overflow-hidden rounded-full bg-primary/10'}>
            <div
              className={cn('h-full rounded-full bg-primary transition-[width] duration-300', progress === null && 'w-1/2 animate-pulse')}
              style={progress === null ? undefined : { width: progress + '%' }}
            />
          </div>
          <div className={'flex items-start justify-between gap-3'}>
            <p className={'text-xs font-medium leading-5 text-muted-foreground'}>{detail}</p>
            <span className={'shrink-0 text-xs font-bold text-primary'}>{progress === null ? 'Preparing' : progress + '%'}</span>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className={'flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-left text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300'} role='alert'>
          <AlertCircle className={'mt-0.5 h-4 w-4 shrink-0'} />
          <span>{error}</span>
        </div>
      ) : null}
    </div>
  )
}
