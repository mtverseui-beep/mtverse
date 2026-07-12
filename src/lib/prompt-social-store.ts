import 'server-only'

import { existsSync } from 'fs'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { hasRuntimeKvStore, readRuntimeJsonNoStore, withRuntimeLock, writeRuntimeJson } from '@/lib/runtime-kv'

const DATA_DIR = join(process.cwd(), 'data')
const STORE_FILE = join(DATA_DIR, 'prompt-social-store.json')
const RUNTIME_STORE_KEY = 'mtverse:prompt-social-store:v1'
const RUNTIME_STORE_LOCK_KEY = 'mtverse:lock:prompt-social-store:v1'

type SavedPromptRecord = {
  savedAt: string
}

type PromptUserRecord = {
  email: string
  savedPrompts: Record<string, SavedPromptRecord>
  updatedAt: string
}

type PromptSocialStoreData = {
  users: Record<string, PromptUserRecord>
  meta: {
    source: string
    updatedAt: string
    count: number
  }
}

export type SavedPromptSummary = {
  slug: string
  savedAt: string
}

function nowIso() {
  return new Date().toISOString()
}

function normalizeEmail(email: string) {
  return email.toLowerCase().trim()
}

function normalizeSlug(slug: string) {
  return slug.trim()
}

function sanitizeText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

function emptyStore(): PromptSocialStoreData {
  return {
    users: {},
    meta: {
      source: 'local-prompt-social-store',
      updatedAt: nowIso(),
      count: 0,
    },
  }
}

function normalizeUserRecord(emailKey: string, record: Partial<PromptUserRecord> | undefined): PromptUserRecord {
  const email = normalizeEmail(record?.email || emailKey)
  const savedPrompts: Record<string, SavedPromptRecord> = {}

  for (const [slug, saved] of Object.entries(record?.savedPrompts || {})) {
    const safeSlug = normalizeSlug(slug)
    if (!safeSlug) continue
    savedPrompts[safeSlug] = {
      savedAt: sanitizeText(saved.savedAt, 40) || nowIso(),
    }
  }

  return {
    email,
    savedPrompts,
    updatedAt: sanitizeText(record?.updatedAt, 40) || nowIso(),
  }
}

function normalizeStore(input: Partial<PromptSocialStoreData> | null | undefined): PromptSocialStoreData {
  const users: Record<string, PromptUserRecord> = {}

  if (input?.users && typeof input.users === 'object') {
    for (const [email, record] of Object.entries(input.users)) {
      const normalized = normalizeUserRecord(email, record)
      users[normalized.email] = normalized
    }
  }

  return {
    users,
    meta: {
      source: sanitizeText(input?.meta?.source, 80) || 'local-prompt-social-store',
      updatedAt: sanitizeText(input?.meta?.updatedAt, 40) || nowIso(),
      count: Object.keys(users).length,
    },
  }
}

async function ensureStoreFile() {
  if (process.env.VERCEL) return

  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true })
  }

  if (!existsSync(STORE_FILE)) {
    await writeFile(STORE_FILE, JSON.stringify(emptyStore(), null, 2), 'utf-8')
  }
}

async function readStore(): Promise<PromptSocialStoreData> {
  if (hasRuntimeKvStore()) {
    const runtimeStore = await readRuntimeJsonNoStore<PromptSocialStoreData>(RUNTIME_STORE_KEY)
    if (runtimeStore) return normalizeStore(runtimeStore)
  }

  await ensureStoreFile()

  try {
    const raw = await readFile(STORE_FILE, 'utf-8')
    return normalizeStore(JSON.parse(raw) as PromptSocialStoreData)
  } catch {
    return emptyStore()
  }
}

async function writeStore(store: PromptSocialStoreData) {
  const payload: PromptSocialStoreData = {
    ...store,
    meta: {
      ...store.meta,
      updatedAt: nowIso(),
      count: Object.keys(store.users).length,
    },
  }

  if (hasRuntimeKvStore()) {
    await writeRuntimeJson(RUNTIME_STORE_KEY, payload)
    return payload
  }

  if (process.env.VERCEL) {
    throw new Error('Prompt social storage needs UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in production.')
  }

  await ensureStoreFile()
  await writeFile(STORE_FILE, JSON.stringify(payload, null, 2), 'utf-8')
  return payload
}

function getUserRecord(store: PromptSocialStoreData, emailInput: string) {
  const email = normalizeEmail(emailInput)
  if (!store.users[email]) {
    store.users[email] = normalizeUserRecord(email, {
      email,
      savedPrompts: {},
      updatedAt: nowIso(),
    })
  }
  return store.users[email]
}

export async function isPromptSaved(slug: string, emailInput: string | null | undefined) {
  const email = emailInput ? normalizeEmail(emailInput) : ''
  if (!email) return false

  const store = await readStore()
  return Boolean(store.users[email]?.savedPrompts?.[normalizeSlug(slug)])
}

export async function setPromptSaved(slug: string, emailInput: string, saved: boolean) {
  const safeSlug = normalizeSlug(slug)
  const email = normalizeEmail(emailInput)
  return withRuntimeLock(RUNTIME_STORE_LOCK_KEY, async () => {
    const store = await readStore()
    const userRecord = getUserRecord(store, email)

    if (saved) {
      userRecord.savedPrompts[safeSlug] = {
        savedAt: userRecord.savedPrompts[safeSlug]?.savedAt || nowIso(),
      }
    } else {
      delete userRecord.savedPrompts[safeSlug]
    }

    userRecord.updatedAt = nowIso()
    store.users[email] = userRecord
    await writeStore(store)
    return Boolean(userRecord.savedPrompts[safeSlug])
  })
}

export async function getSavedPromptRecords(emailInput: string | null | undefined): Promise<SavedPromptSummary[]> {
  const email = emailInput ? normalizeEmail(emailInput) : ''
  if (!email) return []

  const store = await readStore()
  const savedPrompts = store.users[email]?.savedPrompts || {}

  return Object.entries(savedPrompts)
    .map(([slug, record]) => ({ slug, savedAt: record.savedAt }))
    .sort((left, right) => Date.parse(right.savedAt) - Date.parse(left.savedAt))
}
