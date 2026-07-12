import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdminRequest } from '@/lib/admin-request-auth'
import { isGoogleAdsenseConfigured } from '@/lib/adsense'
import { getPaddleConfigurationStatus } from '@/lib/paddle'
import { getRedisClient, hasRuntimeKvStore } from '@/lib/runtime-kv'
import { isCloudflareR2PackageStorageConfigured } from '@/lib/cloudflare-r2'

export const runtime = 'nodejs'

let redisHealthCache: { healthy: boolean; expiresAt: number } | null = null

async function checkRuntimeStore() {
  if (!hasRuntimeKvStore()) return false
  if (redisHealthCache && redisHealthCache.expiresAt > Date.now()) return redisHealthCache.healthy

  let healthy = false
  try {
    await getRedisClient().get('mtverse:health:probe')
    healthy = true
  } catch (error) {
    console.error('[Health] Upstash connectivity check failed.', error)
  }

  redisHealthCache = { healthy, expiresAt: Date.now() + 30_000 }
  return healthy
}

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
  const paddle = getPaddleConfigurationStatus()
  const checks: Record<string, boolean> = {
    server: true,
  }

  checks.r2 = Boolean(
    process.env.CLOUDFLARE_R2_PUBLIC_URL &&
    process.env.CLOUDFLARE_R2_BUCKET &&
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
  )
  checks.privatePackages = isCloudflareR2PackageStorageConfigured()

  checks.upstash = await checkRuntimeStore()

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
    ? paddle.ready
    : process.env.NODE_ENV !== 'production'

  checks.adsense = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ENABLED === 'true'
    ? isGoogleAdsenseConfigured()
    : true

  const allHealthy = Object.values(checks).every(Boolean)
  const status = allHealthy ? 'ok' : 'degraded'
  const body = await canSeeHealthDetails(request)
    ? {
      status,
      timestamp: new Date().toISOString(),
      checks,
      payments: {
        provider: paddle.provider,
        environment: paddle.environment,
        ready: paddle.ready,
        issues: paddle.issues,
      },
    }
    : { status, timestamp: new Date().toISOString() }

  return NextResponse.json(body, {
    status: allHealthy ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}
