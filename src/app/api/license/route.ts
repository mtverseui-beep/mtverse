import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp, getRateLimitRetryAfterSeconds } from '@/lib/rate-limit'
import { getPlan, activateLicense, getLicenseByKey } from '@/lib/plan-store'
import { getCurrentCustomer } from '@/lib/auth/current-customer'
import { authorizeAdminRequest } from '@/lib/admin-request-auth'

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function canAccessLicenseEmail(request: NextRequest, email: string) {
  const [customer, admin] = await Promise.all([
    getCurrentCustomer(),
    authorizeAdminRequest(request),
  ])

  return admin.authorized || Boolean(customer.email && normalizeEmail(customer.email) === normalizeEmail(email))
}

/**
 * GET /api/license?email=xxx
 * Look up license by email
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const customer = await getCurrentCustomer()
  const email = searchParams.get('email') || customer.email

  if (!email) {
    return NextResponse.json(
      { error: 'Sign in to view your license.' },
      { status: 401 }
    )
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: 'Invalid email format' },
      { status: 400 }
    )
  }

  if (!(await canAccessLicenseEmail(request, email))) {
    return NextResponse.json(
      { error: 'You can only view licenses for your signed-in account.' },
      { status: 403 }
    )
  }

  try {
    const record = await getPlan(normalizeEmail(email))

    if (!record) {
      return NextResponse.json({
        found: false,
        plan: 'free',
        email,
      })
    }

    return NextResponse.json({
      found: true,
      plan: record.plan,
      email: record.email,
      licenseKey: record.licenseKey,
      status: record.status || 'active',
      createdAt: record.createdAt,
    })
  } catch (error) {
    console.error('[License API] Error looking up license:', error)
    return NextResponse.json(
      { error: 'Failed to look up license' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/license
 * Verify/activate a license key
 * Body: { licenseKey: string, email: string }
 */
export async function POST(request: NextRequest) {
    const ip = getClientIp(request.headers)
    const rateLimit = await checkRateLimit('license-activate:' + ip, {
      max: 10,
      windowMs: 3600000,
    })
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429, headers: { 'Retry-After': String(getRateLimitRetryAfterSeconds(rateLimit.resetAt)) } })
    }
  try {
    const body = await request.json()
    const { licenseKey, email } = body as { licenseKey?: string; email?: string }

    if (!licenseKey || typeof licenseKey !== 'string') {
      return NextResponse.json(
        { error: 'License key is required' },
        { status: 400 }
      )
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    if (!(await canAccessLicenseEmail(request, email))) {
      return NextResponse.json(
        { error: 'Sign in with this email before activating a license.' },
        { status: 403 }
      )
    }

    // Check if license key exists
    const licenseRecord = await getLicenseByKey(licenseKey)
    if (!licenseRecord) {
      return NextResponse.json(
        { success: false, error: 'Invalid license key' },
        { status: 404 }
      )
    }

    // Activate the license
    const result = await activateLicense(licenseKey, normalizeEmail(email))

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      plan: result.plan,
    })
  } catch (error) {
    console.error('[License API] Error activating license:', error)
    return NextResponse.json(
      { error: 'Failed to activate license' },
      { status: 500 }
    )
  }
}
