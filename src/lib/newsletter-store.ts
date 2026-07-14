import 'server-only'

import { createHash, randomBytes } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { hasRuntimeKvStore, readRuntimeJsonNoStore, withRuntimeLock, writeRuntimeJson } from '@/lib/runtime-kv'

const DATA_DIR = join(process.cwd(), 'data')
const STORE_FILE = join(DATA_DIR, 'newsletter-store.json')
const STORE_KEY = 'mtverse:newsletter-store:v1'
const LOCK_KEY = 'mtverse:lock:newsletter-store:v1'

type Subscriber = {
  email: string
  status: 'active' | 'unsubscribed'
  unsubscribeTokenHash: string
  createdAt: string
  updatedAt: string
  confirmationSentAt?: string
}

type NewsletterStore = {
  subscribers: Record<string, Subscriber>
}

function emptyStore(): NewsletterStore {
  return { subscribers: {} }
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

async function ensureStoreFile() {
  if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true })
  if (!existsSync(STORE_FILE)) await writeFile(STORE_FILE, JSON.stringify(emptyStore(), null, 2), 'utf8')
}

async function readStore() {
  if (hasRuntimeKvStore()) {
    return (await readRuntimeJsonNoStore<NewsletterStore>(STORE_KEY)) || emptyStore()
  }

  await ensureStoreFile()
  try {
    return JSON.parse(await readFile(STORE_FILE, 'utf8')) as NewsletterStore
  } catch {
    return emptyStore()
  }
}

async function writeStore(store: NewsletterStore) {
  if (hasRuntimeKvStore()) {
    await writeRuntimeJson(STORE_KEY, store)
    return
  }

  if (process.env.VERCEL || process.env.NETLIFY) {
    throw new Error('Newsletter storage requires the configured Upstash Redis store in production.')
  }

  await ensureStoreFile()
  await writeFile(STORE_FILE, JSON.stringify(store, null, 2), 'utf8')
}

async function mutateStore<T>(mutator: (store: NewsletterStore) => T | Promise<T>) {
  return withRuntimeLock(LOCK_KEY, async () => {
    const store = await readStore()
    const result = await mutator(store)
    await writeStore(store)
    return result
  })
}

export async function subscribeToNewsletter(emailInput: string) {
  const email = emailInput.toLowerCase().trim()
  const token = randomBytes(32).toString('base64url')
  const now = new Date().toISOString()

  return mutateStore((store) => {
    const existing = store.subscribers[email]
    if (existing?.status === 'active' && existing.confirmationSentAt) {
      return { email, token: '', shouldSendConfirmation: false }
    }

    store.subscribers[email] = {
      email,
      status: 'active',
      unsubscribeTokenHash: hashToken(token),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      confirmationSentAt: undefined,
    }

    return { email, token, shouldSendConfirmation: true }
  })
}

export async function markNewsletterConfirmationSent(emailInput: string) {
  const email = emailInput.toLowerCase().trim()
  await mutateStore((store) => {
    const subscriber = store.subscribers[email]
    if (!subscriber || subscriber.status !== 'active') return
    subscriber.confirmationSentAt = new Date().toISOString()
    subscriber.updatedAt = subscriber.confirmationSentAt
  })
}

export async function unsubscribeFromNewsletter(token: string) {
  const tokenHash = hashToken(token)
  return mutateStore((store) => {
    const subscriber = Object.values(store.subscribers).find((entry) => entry.unsubscribeTokenHash === tokenHash)
    if (!subscriber) return false
    subscriber.status = 'unsubscribed'
    subscriber.updatedAt = new Date().toISOString()
    return true
  })
}
