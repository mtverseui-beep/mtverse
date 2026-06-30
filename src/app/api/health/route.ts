import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdminRequest } from '@/lib/admin-request-auth'
import { isGoogleAdsenseConfigured } from '@/lib/adsense'

export const runtime = 'nodejs'

function hasHealthcheckToken(request: NextRequest) {
  const expectedToken = process.env.HEALTHCHECK_TOKEN?.trim()
  if (!expectedToken) return false

  const header = request.headers.get('authorization') || ''
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match?.[1]?.trim() === expectedToken
}

async function canSeeHealthDetails(request: NextRequest) {
  if (hasHealthcheckToken(request)) return true

  try {
    const admin = await authorizeAdminRequest(request)
    return admin.authorized
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  const checks: Record<string, boolean> = {
    server: true,
  }

  checks.r2 = Boolean(
    process.env.CLOUDFLARE_R2_PUBLIC_URL &&
    process.env.CLOUDFLARE_R2_BUCKET &&
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
  )

  checks.upstash = Boolean(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  )

  checks.adminAuth = Boolean(
    process.env.ADMIN_EMAIL &&
    process.env.ADMIN_PASSWORD_HASH &&
    process.env.ADMIN_SESSION_SECRET
  )

  checks.customerAuth = Boolean(
    process.env.CUSTOMER_SESSION_SECRET &&
    process.env.NEXTAUTH_SECRET
  )

  checks.payments = process.env.PAYMENT_PROVIDER === 'paddle'
    ? Boolean(
        process.env.PADDLE_CLIENT_TOKEN &&
        process.env.PADDLE_API_KEY &&
        process.env.PADDLE_WEBHOOK_SECRET &&
        process.env.PADDLE_NEXT_PRICE_ID
      )
    : process.env.NODE_ENV !== 'production'

  checks.adsense = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ENABLED === 'true'
    ? isGoogleAdsenseConfigured()
    : true

  const allHealthy = Object.values(checks).every(Boolean)
  const status = allHealthy ? 'ok' : 'degraded'
  const body = await canSeeHealthDetails(request)
    ? { status, timestamp: new Date().toISOString(), checks }
    : { status, timestamp: new Date().toISOString() }

  return NextResponse.json(body, {
    status: allHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}