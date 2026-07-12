import 'server-only'

import { randomBytes } from 'node:crypto'
import { existsSync } from 'fs'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { hasRuntimeKvStore, readRuntimeJsonNoStore, withRuntimeLock, writeRuntimeJson } from '@/lib/runtime-kv'

const DATA_DIR = join(process.cwd(), 'data')
const STORE_FILE = join(DATA_DIR, 'template-framework-requests.json')
const RUNTIME_STORE_KEY = 'mtverse:template-framework-requests:v1'
const RUNTIME_STORE_LOCK_KEY = 'mtverse:lock:template-framework-requests:v1'
const MAX_REQUESTS = 1000

export const FRAMEWORK_OPTIONS = ['HTML', 'React', 'Next.js', 'Vue.js', 'Angular', 'Laravel', 'Custom'] as const
export const STYLING_OPTIONS = ['Tailwind CSS', 'Bootstrap', 'shadcn/ui', 'Material UI', 'Plain CSS', 'SCSS', 'No preference', 'Custom'] as const

export type TemplateFrameworkRequestStatus = 'new' | 'reviewed'

export type TemplateFrameworkRequest = {
  id: string
  slug: string
  templateTitle: string
  email: string
  framework: string
  customFramework?: string
  styling: string
  customStyling?: string
  message?: string
  sourcePath: string
  status: TemplateFrameworkRequestStatus
  createdAt: string
  updatedAt: string
}


type TemplateFrameworkRequestInput = {
  id?: unknown
  slug?: unknown
  templateTitle?: unknown
  email?: unknown
  framework?: unknown
  customFramework?: unknown
  styling?: unknown
  customStyling?: unknown
  message?: unknown
  sourcePath?: unknown
  status?: unknown
  createdAt?: unknown
  updatedAt?: unknown
}
type TemplateFrameworkRequestStore = {
  requests: TemplateFrameworkRequest[]
  meta: {
    source: string
    updatedAt: string
    count: number
  }
}

export type TemplateFrameworkRequestStats = {
  total: number
  newCount: number
  customCount: number
  uniqueTemplates: number
  lastSevenDays: number
  frameworkCounts: Array<{ label: string; count: number }>
  stylingCounts: Array<{ label: string; count: number }>
}

function nowIso() {
  return new Date().toISOString()
}

function emptyStore(): TemplateFrameworkRequestStore {
  return {
    requests: [],
    meta: {
      source: 'local-template-framework-requests',
      updatedAt: nowIso(),
      count: 0,
    },
  }
}

function sanitizeText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

function normalizeEmail(value: unknown) {
  return sanitizeText(value, 160).toLowerCase()
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function normalizeOption(value: unknown, allowed: readonly string[], fallback: string) {
  const text = sanitizeText(value, 80)
  return allowed.includes(text) ? text : fallback
}

function normalizeRequest(input: TemplateFrameworkRequestInput): TemplateFrameworkRequest | null {
  const slug = sanitizeText(input.slug, 160)
  const templateTitle = sanitizeText(input.templateTitle, 180)
  const email = normalizeEmail(input.email)
  const framework = normalizeOption(input.framework, FRAMEWORK_OPTIONS, 'Custom')
  const styling = normalizeOption(input.styling, STYLING_OPTIONS, 'No preference')
  const customFramework = sanitizeText(input.customFramework, 80)
  const customStyling = sanitizeText(input.customStyling, 80)
  const createdAt = sanitizeText(input.createdAt, 40) || nowIso()
  const updatedAt = sanitizeText(input.updatedAt, 40) || createdAt

  if (!slug || !templateTitle || !email || !isValidEmail(email)) return null
  if (framework === 'Custom' && !customFramework) return null
  if (styling === 'Custom' && !customStyling) return null

  return {
    id: sanitizeText(input.id, 80) || `tfr-${Date.now()}-${randomBytes(4).toString('hex')}`,
    slug,
    templateTitle,
    email,
    framework,
    customFramework: customFramework || undefined,
    styling,
    customStyling: customStyling || undefined,
    message: sanitizeText(input.message, 600) || undefined,
    sourcePath: sanitizeText(input.sourcePath, 220) || `/templates/${slug}`,
    status: input.status === 'reviewed' ? 'reviewed' : 'new',
    createdAt,
    updatedAt,
  }
}

function normalizeStore(input: Partial<TemplateFrameworkRequestStore> | null | undefined): TemplateFrameworkRequestStore {
  const requests = Array.isArray(input?.requests)
    ? input.requests.map(normalizeRequest).filter(Boolean).slice(0, MAX_REQUESTS) as TemplateFrameworkRequest[]
    : []

  return {
    requests: requests.sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    meta: {
      source: sanitizeText(input?.meta?.source, 80) || emptyStore().meta.source,
      updatedAt: sanitizeText(input?.meta?.updatedAt, 40) || nowIso(),
      count: requests.length,
    },
  }
}

async function readStore(): Promise<TemplateFrameworkRequestStore> {
  if (hasRuntimeKvStore()) {
    const runtimeStore = await readRuntimeJsonNoStore<TemplateFrameworkRequestStore>(RUNTIME_STORE_KEY)
    if (runtimeStore) return normalizeStore(runtimeStore)
  }

  try {
    const raw = await readFile(STORE_FILE, 'utf-8')
    return normalizeStore(JSON.parse(raw) as TemplateFrameworkRequestStore)
  } catch {
    return emptyStore()
  }
}

async function writeStore(store: TemplateFrameworkRequestStore) {
  const payload = normalizeStore({
    ...store,
    meta: {
      ...store.meta,
      updatedAt: nowIso(),
      count: store.requests.length,
    },
  })

  if (hasRuntimeKvStore()) {
    await writeRuntimeJson(RUNTIME_STORE_KEY, payload)
    return payload
  }

  if (process.env.VERCEL) {
    throw new Error('Template framework request storage needs UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in production.')
  }

  if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true })
  await writeFile(STORE_FILE, JSON.stringify(payload, null, 2), 'utf-8')
  return payload
}

function labelForRequest(request: TemplateFrameworkRequest) {
  return request.framework === 'Custom' ? request.customFramework || 'Custom' : request.framework
}

function stylingLabelForRequest(request: TemplateFrameworkRequest) {
  return request.styling === 'Custom' ? request.customStyling || 'Custom' : request.styling
}

function countLabels(values: string[]) {
  const counts = new Map<string, number>()
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1)
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
}

export async function addTemplateFrameworkRequest(input: {
  slug: string
  templateTitle: string
  email: string
  framework: unknown
  customFramework?: unknown
  styling?: unknown
  customStyling?: unknown
  message?: unknown
}) {
  const now = nowIso()
  const request = normalizeRequest({
    slug: input.slug,
    templateTitle: input.templateTitle,
    email: input.email,
    framework: input.framework,
    customFramework: input.customFramework,
    styling: input.styling || 'No preference',
    customStyling: input.customStyling,
    message: input.message,
    sourcePath: `/templates/${input.slug}`,
    createdAt: now,
    updatedAt: now,
  })

  if (!request) {
    throw new Error('A valid email and requested framework are required.')
  }

  return withRuntimeLock(RUNTIME_STORE_LOCK_KEY, async () => {
    const store = await readStore()
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    const duplicate = store.requests.find((item) => {
      if (item.email !== request.email || item.slug !== request.slug) return false
      if (labelForRequest(item).toLowerCase() !== labelForRequest(request).toLowerCase()) return false
      return Date.parse(item.createdAt) >= oneDayAgo
    })

    if (duplicate) return { request: duplicate, duplicate: true }

    store.requests = [request, ...store.requests].slice(0, MAX_REQUESTS)
    await writeStore(store)
    return { request, duplicate: false }
  })
}

export async function getTemplateFrameworkRequests(limit = 100) {
  const store = await readStore()
  return store.requests.slice(0, Math.max(1, limit))
}

export async function getTemplateFrameworkRequestStats(): Promise<TemplateFrameworkRequestStats> {
  const store = await readStore()
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const customCount = store.requests.filter((request) => request.framework === 'Custom' || request.styling === 'Custom').length

  return {
    total: store.requests.length,
    newCount: store.requests.filter((request) => request.status === 'new').length,
    customCount,
    uniqueTemplates: new Set(store.requests.map((request) => request.slug)).size,
    lastSevenDays: store.requests.filter((request) => Date.parse(request.createdAt) >= sevenDaysAgo).length,
    frameworkCounts: countLabels(store.requests.map(labelForRequest)).slice(0, 8),
    stylingCounts: countLabels(store.requests.map(stylingLabelForRequest)).slice(0, 8),
  }
}
