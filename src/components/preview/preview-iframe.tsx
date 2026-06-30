'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, ExternalLink, Loader2, RefreshCw } from 'lucide-react'

type PreviewIframeProps = {
  url: string
  directUrl: string
  title: string
}

export function PreviewIframe({ url, directUrl, title }: PreviewIframeProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // Detect iframe load failure via timeout (X-Frame-Options blocks don't trigger onerror)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        // If still loading after 8s, likely blocked by X-Frame-Options
        setLoading(false)
        setError(true)
      }
    }, 8000)
    return () => clearTimeout(timer)
  }, [loading, retryCount])

  const handleLoad = () => {
    setLoading(false)
    setError(false)
  }

  const handleError = () => {
    setLoading(false)
    setError(true)
  }

  const handleRetry = () => {
    setLoading(true)
    setError(false)
    setRetryCount(prev => prev + 1)
  }

  return (
    <>
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Loading preview...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background p-8">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ExternalLink className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Preview opens in a new tab</h2>
            <p className="text-sm text-muted-foreground mb-6">
              This template preview is best viewed directly. Click below to open the full interactive preview.
            </p>
            <div className="flex flex-col items-center gap-3">
              <a
                href={directUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Open live preview
              </a>
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Try loading here again
              </button>
            </div>
          </div>
        </div>
      )}

      <iframe
        key={retryCount}
        src={url}
        title={`${title} live preview`}
        className="block border-0 bg-background"
        style={{ 
          position: 'absolute', 
          inset: 0, 
          width: '100%', 
          height: '100%', 
          minWidth: '100%', 
          minHeight: '100%',
          display: error ? 'none' : 'block'
        }}
        allow="accelerometer; clipboard-read; clipboard-write; encrypted-media; geolocation; gyroscope; picture-in-picture; publickey-credentials-get; screen-wake-lock"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        loading="eager"
        onLoad={handleLoad}
        onError={handleError}
      />
    </>
  )
}
