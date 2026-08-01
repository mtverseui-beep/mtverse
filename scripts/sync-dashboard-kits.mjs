import { readFile } from 'node:fs/promises'

const url = process.env.UPSTASH_REDIS_REST_URL?.trim().replace(/\/$/, '')
const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
const key = 'mtverse:dashboard-kits:v1'

if (!url || !token) {
  throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required.')
}

async function pipeline(commands) {
  const response = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  })
  const text = await response.text()
  if (!response.ok) throw new Error(`Redis pipeline failed with ${response.status}: ${text}`)
  return JSON.parse(text)
}

const beforeResult = await pipeline([['GET', key]])
const remote = beforeResult[0]?.result ? JSON.parse(beforeResult[0].result) : { kits: [] }
const local = JSON.parse(await readFile(new URL('../data/dashboard-kits-store.json', import.meta.url), 'utf8'))
const enterprise = JSON.parse(await readFile(new URL('../data/enterprise-dashboard-kits.json', import.meta.url), 'utf8'))
const merged = new Map((remote.kits || []).map((kit) => [kit.slug, kit]))

for (const kit of local.kits || []) {
  merged.set(kit.slug, kit)
}

for (const kit of enterprise.kits || []) {
  merged.set(kit.slug, kit)
}

const enterpriseSlugs = new Set((enterprise.kits || []).map((kit) => kit.slug))
const orderedKits = [
  ...(enterprise.kits || []).map((kit) => merged.get(kit.slug)).filter(Boolean),
  ...[...merged.values()].filter((kit) => !enterpriseSlugs.has(kit.slug)),
]
const payload = {
  kits: orderedKits,
  meta: {
    source: 'local-merge-sync',
    updatedAt: new Date().toISOString(),
    count: merged.size,
  },
}

const writeResult = await pipeline([['SET', key, JSON.stringify(payload)]])
if (writeResult[0]?.result !== 'OK') {
  throw new Error(`Unexpected Redis SET result: ${JSON.stringify(writeResult)}`)
}

const afterResult = await pipeline([['GET', key]])
const verified = JSON.parse(afterResult[0].result)
console.log(`redis_before=${(remote.kits || []).length}`)
console.log(`local_templates=${orderedKits.length}`)
console.log(`redis_after=${verified.kits.length}`)
console.log(`redis_source=${verified.meta.source}`)