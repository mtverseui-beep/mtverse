import 'server-only'

import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { hasRuntimeKvStore, readRuntimeJsonNoStore, writeRuntimeJson } from '@/lib/runtime-kv'

const DATA_DIR = join(process.cwd(), 'data')
const STORE_FILE = join(DATA_DIR, 'pricing-settings-store.json')
const RUNTIME_STORE_KEY = 'mtverse:pricing-settings:v1'

export type PricingCtaSettings = {
  badge: string
  title: string
  description: string
  buttonLabel: string
  secondaryLabel: string
  emailSubject: string
  emailPreheader: string
  emailHeadline: string
  emailBody: string
  updatedAt: string
}

const DEFAULT_SETTINGS: PricingCtaSettings = {
  badge: 'Best value',
  title: 'All paid templates bundle',
  description: 'Get every paid Next.js dashboard, ecommerce, and landing template in one ZIP for $149. Future paid template updates are included in your account.',
  buttonLabel: 'Get all paid templates',
  secondaryLabel: 'View templates first',
  emailSubject: 'All paid mtverse templates in one bundle',
  emailPreheader: 'Get every paid mtverse template plus future paid template updates for one $149 payment.',
  emailHeadline: 'Unlock every paid mtverse template',
  emailBody: 'Get all current paid dashboard, ecommerce, and landing templates in one protected bundle. Your account also stays eligible for future paid template updates included with this offer.',
  updatedAt: new Date().toISOString(),
}

function cleanText(value: unknown, fallback: string, maxLength = 220) {
  const text = typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : ''
  if (!text) return fallback
  return text.length > maxLength ? text.slice(0, maxLength).trim() : text
}

function normalizeSettings(input: Partial<PricingCtaSettings> | null | undefined): PricingCtaSettings {
  return {
    badge: cleanText(input?.badge, DEFAULT_SETTINGS.badge, 40),
    title: cleanText(input?.title, DEFAULT_SETTINGS.title, 90),
    description: cleanText(input?.description, DEFAULT_SETTINGS.description, 260),
    buttonLabel: cleanText(input?.buttonLabel, DEFAULT_SETTINGS.buttonLabel, 60),
    secondaryLabel: cleanText(input?.secondaryLabel, DEFAULT_SETTINGS.secondaryLabel, 60),
    emailSubject: cleanText(input?.emailSubject, DEFAULT_SETTINGS.emailSubject, 90),
    emailPreheader: cleanText(input?.emailPreheader, DEFAULT_SETTINGS.emailPreheader, 160),
    emailHeadline: cleanText(input?.emailHeadline, DEFAULT_SETTINGS.emailHeadline, 90),
    emailBody: cleanText(input?.emailBody, DEFAULT_SETTINGS.emailBody, 320),
    updatedAt: typeof input?.updatedAt === 'string' ? input.updatedAt : DEFAULT_SETTINGS.updatedAt,
  }
}

async function ensureStoreFile() {
  if (process.env.VERCEL) return

  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true })
  }

  if (!existsSync(STORE_FILE)) {
    await writeFile(STORE_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8')
  }
}

async function readStore(): Promise<PricingCtaSettings> {
  if (hasRuntimeKvStore()) {
    const runtimeStore = await readRuntimeJsonNoStore<PricingCtaSettings>(RUNTIME_STORE_KEY)
    if (runtimeStore) return normalizeSettings(runtimeStore)
  }

  await ensureStoreFile()

  try {
    const raw = await readFile(STORE_FILE, 'utf-8')
    return normalizeSettings(JSON.parse(raw) as Partial<PricingCtaSettings>)
  } catch {
    return normalizeSettings(DEFAULT_SETTINGS)
  }
}

async function writeStore(settings: PricingCtaSettings) {
  if (hasRuntimeKvStore()) {
    await writeRuntimeJson(RUNTIME_STORE_KEY, settings)
    return settings
  }

  if (process.env.VERCEL) {
    throw new Error('Pricing settings storage needs UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in production.')
  }

  await ensureStoreFile()
  await writeFile(STORE_FILE, JSON.stringify(settings, null, 2), 'utf-8')
  return settings
}

export async function getPricingCtaSettings() {
  return readStore()
}

export async function savePricingCtaSettings(input: Partial<PricingCtaSettings>) {
  const settings = normalizeSettings({ ...input, updatedAt: new Date().toISOString() })
  return writeStore(settings)
}