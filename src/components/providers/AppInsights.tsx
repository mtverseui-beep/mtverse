'use client'

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

export default function AppInsights() {
  const pathname = usePathname()
  const cloudflareWebAnalyticsToken = process.env.NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN?.trim()

  if (pathname?.startsWith('/preview')) {
    return null
  }

  return (
    <>
      <Analytics />
      <SpeedInsights />
      {cloudflareWebAnalyticsToken ? (
        <Script
          id="cloudflare-web-analytics"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          strategy="afterInteractive"
          data-cf-beacon={JSON.stringify({ token: cloudflareWebAnalyticsToken })}
        />
      ) : null}
    </>
  )
}
