import 'server-only'

import { randomUUID } from 'node:crypto'

type PipelineMode = 'read' | 'write'

type PipelineValue = string | number

type PipelineResult = Array<{
  result?: unknown
  error?: string
}>

const MAX_RUNTIME_JSON_PAYLOAD_BYTES = 9_000_000

function getUpstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()

  if (!url || !token) return null

  return {
    url: url.replace(/\/$/, ''),
    token,
  }
}

export function hasRuntimeKvStore() {
  return Boolean(getUpstashConfig())
}

async function callUpstashPipeline(
  commands: Array<Array<PipelineValue>>,
  mode: PipelineMode,
  tags: string[] = [],
  noStore = false,
) {
  const config = getUpstashConfig()
  if (!config) return null

  const init: RequestInit & { next?: { revalidate?: number; tags?: string[] } } = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  }

  if (mode === 'read' && noStore) {
    init.cache = 'no-store'
  } else if (mode === 'read') {
    init.next = {
      revalidate: 300,
      tags,
    }
  } else {
    init.cache = 'no-store'
  }

  const response = await fetch(`${config.url}/pipeline`, init)

  if (!response.ok) {
    throw new Error(`Runtime store failed with ${response.status}`)
  }

  return (await response.json()) as PipelineResult
}

export async function readRuntimeJson<T>(key: string, tags: string[] = []) {
  const result = await callUpstashPipeline([['GET', key]], 'read', tags)
  const raw = result?.[0]?.result

  if (typeof raw !== 'string' || !raw.trim()) return null

  return JSON.parse(raw) as T
}

export async function readRuntimeJsonNoStore<T>(key: string) {
  const result = await callUpstashPipeline([['GET', key]], 'read', [], true)
  const raw = result?.[0]?.result

  if (typeof raw !== 'string' || !raw.trim()) return null

  return JSON.parse(raw) as T
}

export async function writeRuntimeJson<T>(key: string, payload: T) {
  const serialized = JSON.stringify(payload)
  const byteLength = new TextEncoder().encode(serialized).byteLength

  if (byteLength > MAX_RUNTIME_JSON_PAYLOAD_BYTES) {
    throw new Error(
      `Runtime store payload for ${key} is ${(byteLength / 1024 / 1024).toFixed(2)}MB. Store large source, preview HTML, images, and ZIP files in R2 or a detail store instead of one Redis value.`
    )
  }

  await callUpstashPipeline([['SET', key, serialized]], 'write')
}

/**
 * Lightweight Redis client facade over Upstash REST API.
 * Used for simple key-value ops like webhook deduplication.
 */
export function getRedisClient() {
  const config = getUpstashConfig()
  if (!config) {
    throw new Error('Redis (Upstash) is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.')
  }

  return {
    async get(key: string): Promise<string | null> {
      const result = await callUpstashPipeline([['GET', key]], 'read', [], true)
      const raw = result?.[0]?.result
      if (typeof raw !== 'string' || !raw) return null
      return raw
    },

    async set(key: string, value: string): Promise<void> {
      await callUpstashPipeline([['SET', key, value]], 'write')
    },

    async setex(key: string, ttlSeconds: number, value: string): Promise<void> {
      await callUpstashPipeline([['SET', key, value, 'EX', ttlSeconds]], 'write')
    },

    async setNx(key: string, value: string, ttlSeconds: number): Promise<boolean> {
      const result = await callUpstashPipeline(
        [['SET', key, value, 'NX', 'EX', ttlSeconds]],
        'write'
      )
      return result?.[0]?.result === 'OK'
    },

    async compareAndDelete(key: string, expectedValue: string): Promise<boolean> {
      const script = "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end"
      const result = await callUpstashPipeline(
        [['EVAL', script, 1, key, expectedValue]],
        'write'
      )
      return Number(result?.[0]?.result || 0) > 0
    },

    async del(key: string): Promise<void> {
      await callUpstashPipeline([['DEL', key]], 'write')
    },
  }
}

const localLockQueues = new Map<string, Promise<void>>()

async function withLocalLock<T>(key: string, callback: () => Promise<T>): Promise<T> {
  const previous = localLockQueues.get(key) || Promise.resolve()
  let release!: () => void
  const current = new Promise<void>((resolve) => {
    release = resolve
  })
  const queued = previous.then(() => current)
  localLockQueues.set(key, queued)

  await previous
  try {
    return await callback()
  } finally {
    release()
    if (localLockQueues.get(key) === queued) localLockQueues.delete(key)
  }
}

export async function withRuntimeLock<T>(
  key: string,
  callback: () => Promise<T>,
  options: { ttlSeconds?: number; waitMs?: number } = {},
): Promise<T> {
  if (!hasRuntimeKvStore()) return withLocalLock(key, callback)

  const redis = getRedisClient()
  const owner = randomUUID()
  const ttlSeconds = Math.max(5, options.ttlSeconds || 20)
  const waitMs = Math.max(500, options.waitMs || 12_000)
  const deadline = Date.now() + waitMs

  while (Date.now() < deadline) {
    if (await redis.setNx(key, owner, ttlSeconds)) {
      try {
        return await callback()
      } finally {
        await redis.compareAndDelete(key, owner).catch(() => false)
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 40 + Math.floor(Math.random() * 60)))
  }

  throw new Error('Runtime store is busy for ' + key + '. Please retry.')
}
