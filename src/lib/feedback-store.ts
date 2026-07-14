import 'server-only'

import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { hasRuntimeKvStore, readRuntimeJsonNoStore, withRuntimeLock, writeRuntimeJson } from '@/lib/runtime-kv'

const DATA_DIR = join(process.cwd(), 'data')
const STORE_FILE = join(DATA_DIR, 'feedback-store.json')
const STORE_KEY = 'mtverse:feedback-store:v1'
const LOCK_KEY = 'mtverse:lock:feedback-store:v1'
const MAX_RECORDS = 2_000

export type FeedbackRecord = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: 'new' | 'reviewed'
  createdAt: string
}

type FeedbackStore = {
  records: FeedbackRecord[]
}

function emptyStore(): FeedbackStore {
  return { records: [] }
}

async function ensureStoreFile() {
  if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true })
  if (!existsSync(STORE_FILE)) await writeFile(STORE_FILE, JSON.stringify(emptyStore(), null, 2), 'utf8')
}

async function readStore() {
  if (hasRuntimeKvStore()) {
    return (await readRuntimeJsonNoStore<FeedbackStore>(STORE_KEY)) || emptyStore()
  }
  await ensureStoreFile()
  try {
    return JSON.parse(await readFile(STORE_FILE, 'utf8')) as FeedbackStore
  } catch {
    return emptyStore()
  }
}

async function writeStore(store: FeedbackStore) {
  if (hasRuntimeKvStore()) {
    await writeRuntimeJson(STORE_KEY, store)
    return
  }
  if (process.env.VERCEL || process.env.NETLIFY) {
    throw new Error('Feedback storage requires the configured Upstash Redis store in production.')
  }
  await ensureStoreFile()
  await writeFile(STORE_FILE, JSON.stringify(store, null, 2), 'utf8')
}

export async function createFeedback(input: Omit<FeedbackRecord, 'id' | 'status' | 'createdAt'>) {
  return withRuntimeLock(LOCK_KEY, async () => {
    const store = await readStore()
    const record: FeedbackRecord = {
      ...input,
      id: `FB-${randomUUID().replaceAll('-', '').slice(0, 10).toUpperCase()}`,
      status: 'new',
      createdAt: new Date().toISOString(),
    }
    store.records.unshift(record)
    store.records = store.records.slice(0, MAX_RECORDS)
    await writeStore(store)
    return record
  })
}
