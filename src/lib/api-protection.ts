import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, getClientIp, getRateLimitRetryAfterSeconds, type RateLimitConfig } from '@/lib/rate-limit'

export const API_RATE_LIMITS = {
  feedback: { max: 30, windowMs: 60_000 },
} satisfies Record<string, RateLimitConfig>

export const API_BODY_LIMITS = {
  jsonSmall: 256 * 1024,
}

class RouteError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'RouteError'
    this.status = status
  }
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${Math.round(bytes / (1024 * 1024))} MB`
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`
  return `${bytes} bytes`
}

export async function guardRateLimit(
  req: NextRequest,
  scope: string,
  config: RateLimitConfig,
  message = 'Too many requests. Please retry in a moment.'
): Promise<NextResponse | null> {
  const ip = getClientIp(req.headers)
  const limit = await checkRateLimit(`${scope}:${ip}`, config)

  if (limit.allowed) return null

  const response = NextResponse.json({ error: message }, { status: 429 })
  response.headers.set('Retry-After', String(getRateLimitRetryAfterSeconds(limit.resetAt)))
  response.headers.set('X-RateLimit-Limit', String(config.max))
  response.headers.set('X-RateLimit-Remaining', String(limit.remaining))
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(limit.resetAt / 1000)))
  return response
}

export async function readJsonBody<T>(req: NextRequest, maxBytes: number): Promise<T> {
  const contentLength = Number(req.headers.get('content-length') || '')

  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new RouteError(`Request body exceeds the ${formatBytes(maxBytes)} limit.`, 413)
  }

  const raw = await req.text()
  if (Buffer.byteLength(raw, 'utf8') > maxBytes) {
    throw new RouteError(`Request body exceeds the ${formatBytes(maxBytes)} limit.`, 413)
  }

  try {
    return JSON.parse(raw || '{}') as T
  } catch {
    throw new RouteError('Invalid JSON body.', 400)
  }
}
