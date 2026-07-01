'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ExternalLink, Loader2, RefreshCw } from 'lucide-react'

type PreviewIframeProps = {
  url: string
  directUrl: string
  title: string
}

export function PreviewIframe({ url, directUrl, title }: PreviewIframeProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const loadedRef = useRef(false)

  // Warm up the preview server with a HEAD request to avoid cold start delay
  useEffect(() => {
    fetch(url, { method: 'HEAD', mode: 'no-cors' }).catch(() => {})
  }, [url])

  // Timeout: 15s covers cold starts. Only error if onLoad never fires.
  useEffect(() => {
    loadedRef.current = false
    const timer = setTimeout(() => {
      if (!loadedRef.current && loading) {
        setLoading(false)
        setError(true)
      }
    }, 15000)
    return () => clearTimeout(timer)
  }, [retryCount]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoad = useCallback(() => {
    loadedRef.current = true
    setLoading(false)
    setError(false)
  }, [])

  const handleError = useCallback(() => {
    loadedRef.current = true
    setLoading(false)
    setError(true)
  }, [])

  const handleRetry = useCallback(() => {
    setLoading(true)
    setError(false)
    setRetryCount(prev => prev + 1)
  }, [])

  return (
    <>
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Loading preview...</p>
            <p className="mt-1 text-xs text-muted-foreground/60">This may take a few seconds on first load</p>
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
        ref={iframeRef}
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
