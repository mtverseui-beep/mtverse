import 'server-only'

import { createHash, randomBytes } from 'crypto'
import { existsSync } from 'fs'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { hasRuntimeKvStore, readRuntimeJsonNoStore, writeRuntimeJson } from '@/lib/runtime-kv'

const DATA_DIR = join(process.cwd(), 'data')
const STORE_FILE = join(DATA_DIR, 'password-reset-store.json')
const RUNTIME_STORE_KEY = 'mtverse:password-reset-store:v1'
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000

type PasswordResetRecord = {
  email: string
  tokenHash: string
  createdAt: string
  expiresAt: string
}

type PasswordResetStoreData = {
  tokens: Record<string, PasswordResetRecord>
}

function emptyStore(): PasswordResetStoreData {
  return { tokens: {} }
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function normalizeEmail(email: string) {
  return email.toLowerCase().trim()
}

async function ensureStoreFile() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true })
  }

  if (!existsSync(STORE_FILE)) {
    await writeFile(STORE_FILE, JSON.stringify(emptyStore(), null, 2), 'utf-8')
  }
}

async function readStore(): Promise<PasswordResetStoreData> {
  if (hasRuntimeKvStore()) {
    return (await readRuntimeJsonNoStore<PasswordResetStoreData>(RUNTIME_STORE_KEY)) || emptyStore()
  }

  await ensureStoreFile()

  try {
    const raw = await readFile(STORE_FILE, 'utf-8')
    return JSON.parse(raw) as PasswordResetStoreData
  } catch {
    return emptyStore()
  }
}

async function writeStore(data: PasswordResetStoreData) {
  if (hasRuntimeKvStore()) {
    await writeRuntimeJson(RUNTIME_STORE_KEY, data)
    return
  }

  if (process.env.VERCEL) {
    throw new Error('Password reset storage needs UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in production.')
  }

  await ensureStoreFile()
  await writeFile(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

function pruneExpired(store: PasswordResetStoreData) {
  const now = Date.now()
  for (const [hash, record] of Object.entries(store.tokens)) {
    if (Date.parse(record.expiresAt) <= now) {
      delete store.tokens[hash]
    }
  }
}

export async function createPasswordResetToken(emailInput: string) {
  const store = await readStore()
  const email = normalizeEmail(emailInput)
  const token = randomBytes(32).toString('base64url')
  const tokenHash = hashToken(token)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + RESET_TOKEN_TTL_MS)

  pruneExpired(store)

  for (const [hash, record] of Object.entries(store.tokens)) {
    if (record.email === email) {
      delete store.tokens[hash]
    }
  }

  store.tokens[tokenHash] = {
    email,
    tokenHash,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  }

  await writeStore(store)

  return {
    token,
    expiresAt: expiresAt.toISOString(),
  }
}

export async function getPasswordResetEmail(token: string) {
  const store = await readStore()
  const tokenHash = hashToken(token)
  const record = store.tokens[tokenHash]

  if (!record) return null

  if (Date.parse(record.expiresAt) <= Date.now()) {
    delete store.tokens[tokenHash]
    await writeStore(store)
    return null
  }

  return record.email
}

export async function consumePasswordResetToken(token: string) {
  const store = await readStore()
  const tokenHash = hashToken(token)
  const record = store.tokens[tokenHash]

  if (!record) return false

  delete store.tokens[tokenHash]
  await writeStore(store)

  return Date.parse(record.expiresAt) > Date.now()
}
