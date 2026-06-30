import 'server-only'

import { existsSync } from 'fs'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { dashboardKits, type DashboardKit, type DashboardKitStatus } from '@/lib/dashboard-kits'
import { hasRuntimeKvStore, readRuntimeJsonNoStore, writeRuntimeJson } from '@/lib/runtime-kv'
import { slugify } from '@/lib/utils'

const DATA_DIR = join(process.cwd(), 'data')
const STORE_FILE = join(DATA_DIR, 'dashboard-kits-store.json')
const RUNTIME_STORE_KEY = 'mtverse:dashboard-kits:v1'

export type DashboardKitStoreData = {
  kits: DashboardKit[]
  meta: {
    source: string
    updatedAt: string
    count: number
  }
}

function createDefaultStore(): DashboardKitStoreData {
  return {
    kits: dashboardKits,
    meta: {
      source: 'static-defaults',
      updatedAt: new Date().toISOString(),
      count: dashboardKits.length,
    },
  }
}

function cleanText(value: unknown) {
  const raw = String(value ?? '').trim()
  if (!raw) return ''

  let output = raw
  if (/[\u00c2\u00c3\u00e2]/.test(output)) {
    try {
      const decoded = Buffer.from(output, 'latin1').toString('utf8')
      if (decoded && !decoded.includes('\uFFFD')) output = decoded
    } catch {}
  }

  return output
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanStringArray(values: string[]) {
  return values.map((item) => cleanText(item)).filter(Boolean)
}

function cleanHighlights(value: unknown, fallback: DashboardKit['highlights']) {
  if (!Array.isArray(value) || !value.length) return fallback

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const record = item as { label?: unknown; value?: unknown }
      return {
        label: cleanText(record.label),
        value: cleanText(record.value),
      }
    })
    .filter((item): item is { label: string; value: string } => Boolean(item?.label || item?.value))
}

function buildSeoTitle(title: string, categoryTitle: string) {
  return cleanText(title + ' | ' + (categoryTitle || 'Premium') + ' Template')
}

function buildMetaDescription(title: string, summary: string, categoryTitle: string) {
  const source = cleanText(summary) || 'Download ' + title + ', a production-ready ' + (categoryTitle || 'dashboard') + ' template with live preview, screenshots, secure ZIP delivery, and reusable UI pages.'
  return source.length > 158 ? source.slice(0, 155).trim() + '...' : source
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return cleanStringArray(value.map((item) => String(item)))
  }

  if (typeof value === 'string') {
    const newlineItems = value
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean)

    if (newlineItems.length > 1 || !value.includes(',') || value.length > 160) {
      return cleanStringArray(newlineItems)
    }

    return cleanStringArray(value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean))
  }

  return []
}

function normalizeStatus(value: unknown): DashboardKitStatus {
  if (value === 'available' || value === 'draft' || value === 'coming-soon') return value
  return 'draft'
}

export function normalizeDashboardKit(input: Partial<DashboardKit>): DashboardKit {
  const slug = slugify(input.slug || input.title || 'kit-' + Date.now())
  const title = cleanText(input.title || slug)
  const shortTitle = cleanText(input.shortTitle || title)
  const priceUsd = Number.isFinite(Number(input.priceUsd)) ? Number(input.priceUsd) : 12
  const originalPriceUsd = Number.isFinite(Number(input.originalPriceUsd)) ? Number(input.originalPriceUsd) : 49
  const previewPath = cleanText(input.previewPath || '/dashboard-kits/' + slug)
  const packageFilename = cleanText(input.packageFilename || 'mtverse-next-package.zip')
  const matchedFallback = dashboardKits.find((kit) => kit.slug === slug)
  const fallback = matchedFallback || dashboardKits[0]
  const category = slugify(cleanText(input.category || 'dashboard-kits')) || 'dashboard-kits'
  const categoryTitle = cleanText(input.categoryTitle || (category === 'dashboard-kits' ? 'Dashboard Kits' : category))
  const summary = cleanText(input.summary || input.description || fallback.summary)
  const description = cleanText(input.description || input.summary || fallback.description)

  return {
    id: cleanText(input.id || 'dashboard-kit-' + slug),
    slug,
    title,
    shortTitle,
    status: normalizeStatus(input.status),
    category,
    categoryTitle,
    summary,
    description,
    seoTitle: cleanText(input.seoTitle) || buildSeoTitle(title, categoryTitle),
    metaDescription: cleanText(input.metaDescription) || buildMetaDescription(title, summary || description, categoryTitle),
    priceUsd,
    originalPriceUsd,
    framework: 'nextjs',
    frameworkLabel: cleanText(input.frameworkLabel || 'Next.js App Router'),
    previewPath,
    packageFilename,
    packageKey: input.packageKey ? cleanText(input.packageKey) : matchedFallback?.packageKey,
    coverImage: input.coverImage ? cleanText(input.coverImage) : fallback.coverImage,
    screenshots: asStringArray(input.screenshots).length ? asStringArray(input.screenshots) : fallback.screenshots,
    tags: asStringArray(input.tags).length ? asStringArray(input.tags) : fallback.tags,
    keywords: asStringArray(input.keywords).length ? asStringArray(input.keywords) : fallback.keywords,
    techStack: asStringArray(input.techStack).length ? asStringArray(input.techStack) : fallback.techStack,
    includedPages: asStringArray(input.includedPages).length ? asStringArray(input.includedPages) : fallback.includedPages,
    features: asStringArray(input.features).length ? asStringArray(input.features) : fallback.features,
    highlights: cleanHighlights(input.highlights, fallback.highlights),
    useCases: asStringArray(input.useCases).length ? asStringArray(input.useCases) : fallback.useCases,
    metadataLanguages: Array.isArray(input.metadataLanguages) && input.metadataLanguages.length ? input.metadataLanguages : fallback.metadataLanguages,
    updatedAt: cleanText(input.updatedAt || new Date().toISOString().slice(0, 10)),
  }
}

async function ensureStoreFile() {
  if (process.env.VERCEL) return

  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true })
  }

  if (!existsSync(STORE_FILE)) {
    await writeFile(STORE_FILE, JSON.stringify(createDefaultStore(), null, 2), 'utf-8')
  }
}

async function readStore(): Promise<DashboardKitStoreData> {
  if (hasRuntimeKvStore()) {
    const runtimeStore = await readRuntimeJsonNoStore<DashboardKitStoreData>(RUNTIME_STORE_KEY)
    if (runtimeStore?.kits?.length) return runtimeStore
  }

  await ensureStoreFile()

  try {
    const raw = await readFile(STORE_FILE, 'utf-8')
    const parsed = JSON.parse(raw) as DashboardKitStoreData
    if (parsed?.kits?.length) return parsed
  } catch {
    return createDefaultStore()
  }

  return createDefaultStore()
}

async function writeStore(kits: DashboardKit[], source: string) {
  const payload: DashboardKitStoreData = {
    kits,
    meta: {
      source,
      updatedAt: new Date().toISOString(),
      count: kits.length,
    },
  }

  if (hasRuntimeKvStore()) {
    await writeRuntimeJson(RUNTIME_STORE_KEY, payload)
    return payload
  }

  if (process.env.VERCEL) {
    throw new Error('Dashboard kit storage needs UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in production.')
  }

  await ensureStoreFile()
  await writeFile(STORE_FILE, JSON.stringify(payload, null, 2), 'utf-8')
  return payload
}

export async function getDashboardKitStore() {
  const store = await readStore()
  return {
    ...store,
    kits: store.kits.map((kit) => normalizeDashboardKit(kit)),
  }
}

export async function getDashboardKits() {
  const store = await getDashboardKitStore()
  return store.kits
}

export async function getDashboardKit(slug: string) {
  const kits = await getDashboardKits()
  return kits.find((kit) => kit.slug === slug) || null
}

export async function saveDashboardKit(input: Partial<DashboardKit>) {
  const store = await getDashboardKitStore()
  const kit = normalizeDashboardKit(input)
  const nextKits = store.kits.some((item) => item.slug === kit.slug || item.id === kit.id)
    ? store.kits.map((item) => (item.slug === kit.slug || item.id === kit.id ? kit : item))
    : [kit, ...store.kits]

  await writeStore(nextKits, 'admin-save')
  return kit
}

export async function saveDashboardKits(inputs: Array<Partial<DashboardKit>>, replaceExisting = false) {
  const normalized = inputs.map((kit) => normalizeDashboardKit(kit))
  const store = await getDashboardKitStore()
  const map = new Map(store.kits.map((kit) => [kit.slug, kit]))

  for (const kit of normalized) {
    const existing = store.kits.find((item) => item.slug === kit.slug || item.id === kit.id)

    if (existing && !replaceExisting) {
      continue
    }

    if (existing && existing.slug !== kit.slug) {
      map.delete(existing.slug)
    }

    map.set(kit.slug, kit)
  }

  const nextKits = Array.from(map.values())
  await writeStore(nextKits, replaceExisting ? 'admin-json-update-matches' : 'admin-json-merge-new')
  return nextKits
}

export async function deleteDashboardKit(slugOrId: string) {
  const store = await getDashboardKitStore()
  const target = slugOrId.trim()
  const nextKits = store.kits.filter((kit) => kit.slug !== target && kit.id !== target)
  await writeStore(nextKits, 'admin-delete')
  return nextKits.length !== store.kits.length
}

