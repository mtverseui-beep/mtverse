import 'server-only'

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
