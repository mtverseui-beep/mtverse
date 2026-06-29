import 'server-only'

import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import { hasRuntimeKvStore, readRuntimeJsonNoStore, writeRuntimeJson } from '@/lib/runtime-kv'

const DATA_DIR = path.join(process.cwd(), 'data')
const LOCAL_ENTERTAINMENT_LINKS_FILE = path.join(DATA_DIR, 'entertainment-links-local-store.json')
const UPSTASH_ENTERTAINMENT_LINKS_KEY = 'mtverse:entertainment-links:v1'

export type EntertainmentLinkSetting = {
  id: string
  label: string
  href: string
  enabled: boolean
  updatedAt?: string
}

type EntertainmentLinksStoreFile = {
  links: EntertainmentLinkSetting[]
  meta?: {
    source: string
    generatedAt: string
    count: number
  }
}

export const DEFAULT_ENTERTAINMENT_LINKS: EntertainmentLinkSetting[] = [
  {
    id: 'the-boys-s05e08',
    label: 'The Boys S05E08 external link',
    href: '',
    enabled: false,
  },
]

async function ensureDataDirectory() {
  await mkdir(DATA_DIR, { recursive: true })
}

function normalizeUrl(value: string) {
  const href = value.trim()
  if (!href) return ''

  try {
    const url = new URL(href)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return ''
    return url.toString()
  } catch {
    return ''
  }
}

function normalizeLink(link: Partial<EntertainmentLinkSetting>): EntertainmentLinkSetting | null {
  if (!link || typeof link !== 'object' || !link.id) return null

  const fallback = DEFAULT_ENTERTAINMENT_LINKS.find((item) => item.id === link.id)
  const href = normalizeUrl(String(link.href || ''))

  return {
    id: String(link.id),
    label: String(link.label || fallback?.label || link.id),
    href,
    enabled: Boolean(link.enabled) && Boolean(href),
    updatedAt: typeof link.updatedAt === 'string' ? link.updatedAt : undefined,
  }
}

function mergeLinks(links: Partial<EntertainmentLinkSetting>[]) {
  const byId = new Map(DEFAULT_ENTERTAINMENT_LINKS.map((link) => [link.id, { ...link }]))

  for (const link of links) {
    const normalized = normalizeLink(link)
    if (!normalized) continue
    byId.set(normalized.id, normalized)
  }

  return Array.from(byId.values())
}

async function readLocalLinks() {
  try {
    const raw = await readFile(LOCAL_ENTERTAINMENT_LINKS_FILE, 'utf8')
    const parsed = JSON.parse(raw) as Partial<EntertainmentLinksStoreFile>
    return mergeLinks(Array.isArray(parsed.links) ? parsed.links : [])
  } catch {
    return DEFAULT_ENTERTAINMENT_LINKS
  }
}

export async function getEntertainmentLinks() {
  if (hasRuntimeKvStore()) {
    try {
      const payload = await readRuntimeJsonNoStore<Partial<EntertainmentLinksStoreFile>>(UPSTASH_ENTERTAINMENT_LINKS_KEY)
      if (payload && Array.isArray(payload.links)) {
        return mergeLinks(payload.links)
      }
    } catch (error) {
      console.error('Entertainment link Upstash store read failed:', error)
      if (process.env.VERCEL) return DEFAULT_ENTERTAINMENT_LINKS
    }
  }

  return readLocalLinks()
}

export async function getEntertainmentLink(id: string) {
  const links = await getEntertainmentLinks()
  return links.find((link) => link.id === id) || DEFAULT_ENTERTAINMENT_LINKS.find((link) => link.id === id) || null
}

export async function saveEntertainmentLinks(links: Partial<EntertainmentLinkSetting>[]) {
  const now = new Date().toISOString()
  const normalizedLinks = mergeLinks(links).map((link) => ({
    ...link,
    updatedAt: now,
  }))
  const payload: EntertainmentLinksStoreFile = {
    links: normalizedLinks,
    meta: {
      source: 'admin-save',
      generatedAt: now,
      count: normalizedLinks.length,
    },
  }

  if (hasRuntimeKvStore()) {
    await writeRuntimeJson(UPSTASH_ENTERTAINMENT_LINKS_KEY, payload)

    if (!process.env.VERCEL) {
      await ensureDataDirectory()
      await writeFile(LOCAL_ENTERTAINMENT_LINKS_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
    }

    return normalizedLinks
  }

  if (process.env.VERCEL) {
    throw new Error(
      'Entertainment link writes need UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN on Vercel, or must be run locally where data files are writable.',
    )
  }

  await ensureDataDirectory()
  await writeFile(LOCAL_ENTERTAINMENT_LINKS_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')

  return normalizedLinks
}
