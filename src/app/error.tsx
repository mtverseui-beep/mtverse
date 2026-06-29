'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { RefreshCw, Home, AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-xl mx-auto text-center space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="ds-display-2">
            Some<span className="ds-text-emphasis">thing</span> went wrong
          </h1>
          <p className="ds-lead">An unexpected error occurred</p>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          We&apos;ve been notified of this error and are working to fix it. Please try again,
          or return to the homepage.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button onClick={reset} className="ds-btn ds-btn-primary">
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link href="/" className="ds-btn ds-btn-secondary">
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </div>
      </div>
    </main>
  )
}
