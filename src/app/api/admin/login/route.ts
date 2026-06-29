import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminCredentials, createAdminSessionToken, ADMIN_SESSION_COOKIE } from '@/lib/admin-auth'
import { checkRateLimit, getClientIp, getRateLimitRetryAfterSeconds } from '@/lib/rate-limit'

type AdminLoginPayload = {
  email?: string
  password?: string
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request.headers)
    const rateLimit = await checkRateLimit(`admin-login:${ip}`, {
      max: 8,
      windowMs: 15 * 60 * 1000,
    })

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please wait a few minutes and try again.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(getRateLimitRetryAfterSeconds(rateLimit.resetAt)),
            'Cache-Control': 'no-store',
          },
        },
      )
    }

    const { email, password } = (await request.json()) as AdminLoginPayload

    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400, headers: { 'Cache-Control': 'no-store' } },
      )
    }

    let adminCreds
    try {
      adminCreds = getAdminCredentials()
    } catch (e) {
      return NextResponse.json(
        { error: 'Admin credentials not configured on the server' },
        { status: 500, headers: { 'Cache-Control': 'no-store' } },
      )
    }

    if (email.toLowerCase() !== adminCreds.email.toLowerCase() || password !== adminCreds.password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } },
      )
    }

    const token = await createAdminSessionToken(adminCreds.email)
    
    ;(await cookies()).set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return NextResponse.json(
      { success: true, redirectUrl: '/admin' },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
