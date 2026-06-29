'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0a0a0a',
            color: '#fafafa',
            padding: '1rem',
          }}
        >
          <div style={{ maxWidth: '32rem', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
              Application error
            </h1>
            <p style={{ color: '#a3a3a3', marginBottom: '2rem' }}>
              A critical error occurred. We&apos;ve been notified. Please try refreshing the page.
            </p>
            {error.digest && (
              <p style={{ fontSize: '0.75rem', color: '#737373', fontFamily: 'monospace', marginBottom: '1.5rem' }}>
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '9999px',
                fontSize: '0.9375rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
