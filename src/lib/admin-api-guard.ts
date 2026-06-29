import 'server-only'

import { NextRequest, NextResponse } from 'next/server'
import { authorizeAdminRequest } from '@/lib/admin-request-auth'
import { checkRateLimit, getClientIp, getRateLimitRetryAfterSeconds } from '@/lib/rate-limit'

type AdminWriteGuardOptions = {
  key: string
  maxRequests?: number
  windowMs?: number
  maxBytes?: number
}

function guardedJson(error: string, status: number, code: string, headers?: HeadersInit) {
  return NextResponse.json(
    {
      success: false,
      error,
      code,
    },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
        ...headers,
      },
    },
  )
}

export async function guardAdminWriteRequest(
  request: NextRequest,
  {
    key,
    maxRequests = 30,
    windowMs = 15 * 60 * 1000,
    maxBytes = 2 * 1024 * 1024,
  }: AdminWriteGuardOptions,
) {
  const auth = await authorizeAdminRequest(request)

  if (!auth.authorized) {
    return guardedJson('Admin session expired. Sign in again to continue.', 401, 'unauthorized')
  }

  const contentLength = Number(request.headers.get('content-length') || '0')
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return guardedJson('Payload is too large for this admin action.', 413, 'payload_too_large')
  }

  const ip = getClientIp(request.headers)
  const rateLimit = await checkRateLimit(`admin-write:${key}:${ip}`, {
    max: maxRequests,
    windowMs,
  })

  if (!rateLimit.allowed) {
    return guardedJson(
      'Too many admin actions. Please wait a few minutes and try again.',
      429,
      'rate_limited',
      {
        'Retry-After': String(getRateLimitRetryAfterSeconds(rateLimit.resetAt)),
      },
    )
  }

  return null
}
