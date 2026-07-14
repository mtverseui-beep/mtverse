'use client'

import Script from 'next/script'

export default function AppInsights() {
  const cloudflareWebAnalyticsToken = process.env.NEXT_PUBLIC_CLOUDFLARE_WEB_ANALYTICS_TOKEN?.trim()

  if (!cloudflareWebAnalyticsToken) return null

  return (
    <Script
      id="cloudflare-web-analytics"
      src="https://static.cloudflareinsights.com/beacon.min.js"
      strategy="afterInteractive"
      data-cf-beacon={JSON.stringify({ token: cloudflareWebAnalyticsToken })}
    />
  )
}