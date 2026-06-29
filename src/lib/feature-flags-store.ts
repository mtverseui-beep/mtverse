import 'server-only'

import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import { hasRuntimeKvStore, readRuntimeJson, writeRuntimeJson } from '@/lib/runtime-kv'

const DATA_DIR = path.join(process.cwd(), 'data')
const LOCAL_FEATURE_FLAGS_FILE = path.join(DATA_DIR, 'feature-flags-local-store.json')
const UPSTASH_FEATURE_FLAGS_KEY = 'mtverse:feature-flags:v1'

export type AdminFeatureFlag = {
  id: string
  group: string
  label: string
  desc: string
  enabled: boolean
}

type FeatureFlagsStoreFile = {
  flags: AdminFeatureFlag[]
  meta?: {
    source: string
    generatedAt: string
    count: number
  }
}

async function ensureDataDirectory() {
  await mkdir(DATA_DIR, { recursive: true })
}

function normalizeFlag(flag: AdminFeatureFlag): AdminFeatureFlag | null {
  if (!flag || typeof flag !== 'object') return null
  if (!flag.id || !flag.group || !flag.label) return null

  return {
    id: String(flag.id),
    group: String(flag.group),
    label: String(flag.label),
    desc: String(flag.desc || ''),
    enabled: Boolean(flag.enabled),
  }
}

function normalizeFlags(flags: AdminFeatureFlag[]) {
  const byId = new Map<string, AdminFeatureFlag>()

  for (const flag of flags) {
    const normalized = normalizeFlag(flag)
    if (normalized) byId.set(normalized.id, normalized)
  }

  return Array.from(byId.values())
}

export async function getSavedFeatureFlags() {
  if (hasRuntimeKvStore()) {
    try {
      const payload = await readRuntimeJson<Partial<FeatureFlagsStoreFile>>(UPSTASH_FEATURE_FLAGS_KEY, ['feature-flags'])
      if (payload && Array.isArray(payload.flags)) {
        return normalizeFlags(payload.flags as AdminFeatureFlag[])
      }
    } catch (error) {
      console.error('Feature flag Upstash store read failed:', error)
      if (process.env.VERCEL) return []
    }
  }

  try {
    const raw = await readFile(LOCAL_FEATURE_FLAGS_FILE, 'utf8')
    const parsed = JSON.parse(raw) as Partial<FeatureFlagsStoreFile>
    return Array.isArray(parsed.flags) ? normalizeFlags(parsed.flags as AdminFeatureFlag[]) : []
  } catch {
    return []
  }
}

export async function saveFeatureFlags(flags: AdminFeatureFlag[]) {
  const normalizedFlags = normalizeFlags(flags)
  const payload: FeatureFlagsStoreFile = {
    flags: normalizedFlags,
    meta: {
      source: 'admin-save',
      generatedAt: new Date().toISOString(),
      count: normalizedFlags.length,
    },
  }

  if (hasRuntimeKvStore()) {
    await writeRuntimeJson(UPSTASH_FEATURE_FLAGS_KEY, payload)

    if (!process.env.VERCEL) {
      await ensureDataDirectory()
      await writeFile(LOCAL_FEATURE_FLAGS_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
    }

    return normalizedFlags
  }

  if (process.env.VERCEL) {
    throw new Error(
      'Feature flag writes need UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN on Vercel, or must be run locally where data files are writable.'
    )
  }

  await ensureDataDirectory()
  await writeFile(LOCAL_FEATURE_FLAGS_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')

  return normalizedFlags
}
