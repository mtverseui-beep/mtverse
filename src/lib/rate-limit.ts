/**
 * Shared rate limiter for API routes.
 *
 * Default behavior uses an in-memory Map, which is fine for local development
 * and single-instance deployments. When `UPSTASH_REDIS_REST_URL` and
 * `UPSTASH_REDIS_REST_TOKEN` are configured, the same API automatically uses a
 * shared fixed-window counter through Upstash REST so production instances
 * enforce limits consistently.
 */

type RateLimitRecord = { count: number; reset: number }

const buckets = new Map<string, RateLimitRecord>()
let lastPruneAt = 0
const PRUNE_INTERVAL = 60_000

function prune(now: number) {
  if (now - lastPruneAt < PRUNE_INTERVAL) return
  for (const [key, record] of buckets.entries()) {
    if (now > record.reset) buckets.delete(key)
  }
  lastPruneAt = now
}

export type RateLimitConfig = {
  max: number
  windowMs: number
}

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetAt: number
  provider: 'memory' | 'upstash'
}

function getBucketWindow(now: number, windowMs: number) {
  const bucketStart = Math.floor(now / windowMs) * windowMs
  return {
    bucketStart,
    resetAt: bucketStart + windowMs,
  }
}

function getUpstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()

  if (!url || !token) return null

  return {
    url: url.replace(/\/$/, ''),
    token,
  }
}

function checkRateLimitMemory(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  prune(now)

  const { resetAt } = getBucketWindow(now, config.windowMs)
  const bucketKey = `${key}:${resetAt}`
  const record = buckets.get(bucketKey)

  if (!record || now > record.reset) {
    buckets.set(bucketKey, { count: 1, reset: resetAt })
    return {
      allowed: true,
      remaining: Math.max(0, config.max - 1),
      resetAt,
      provider: 'memory',
    }
  }

  if (record.count >= config.max) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.reset,
      provider: 'memory',
    }
  }

  record.count += 1
  return {
    allowed: true,
    remaining: Math.max(0, config.max - record.count),
    resetAt: record.reset,
    provider: 'memory',
  }
}

async function callUpstashPipeline(commands: Array<Array<string | number>>) {
  const config = getUpstashConfig()
  if (!config) return null

  const response = await fetch(`${config.url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Upstash rate limiter failed with ${response.status}`)
  }

  return (await response.json()) as Array<{ result?: string | number | null }>
}

async function checkRateLimitUpstash(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
  const now = Date.now()
  const { bucketStart, resetAt } = getBucketWindow(now, config.windowMs)
  const windowSeconds = Math.max(1, Math.ceil(config.windowMs / 1000))
  const bucketKey = `ratelimit:${key}:${bucketStart}`

  const result = await callUpstashPipeline([
    ['INCR', bucketKey],
    ['EXPIRE', bucketKey, windowSeconds + 5],
  ])

  if (!result) {
    return checkRateLimitMemory(key, config)
  }

  const count = Number(result[0]?.result || 0)
  const allowed = count <= config.max

  return {
    allowed,
    remaining: allowed ? Math.max(0, config.max - count) : 0,
    resetAt,
    provider: 'upstash',
  }
}

export async function checkRateLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
  try {
    if (getUpstashConfig()) {
      return await checkRateLimitUpstash(key, config)
    }
  } catch (error) {
    console.error('Rate limit store fallback triggered:', error)
  }

  return checkRateLimitMemory(key, config)
}

export function getRateLimitRetryAfterSeconds(resetAt: number) {
  return Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))
}

export function getClientIp(headers: Headers): string {
  return (
    headers.get('cf-connecting-ip')?.trim() ||
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip')?.trim() ||
    'unknown'
  )
}

