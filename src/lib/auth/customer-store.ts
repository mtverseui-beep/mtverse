import 'server-only'

import { existsSync } from 'fs'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto'
import { promisify } from 'util'
import { join } from 'path'
import { hasRuntimeKvStore, readRuntimeJsonNoStore, withRuntimeLock, writeRuntimeJson } from '@/lib/runtime-kv'

const scrypt = promisify(scryptCallback)
const DATA_DIR = join(process.cwd(), 'data')
const STORE_FILE = join(DATA_DIR, 'customer-store.json')
const RUNTIME_STORE_KEY = 'mtverse:customer-store:v1'
const RUNTIME_STORE_LOCK_KEY = 'mtverse:lock:customer-store:v1'

export type CustomerProvider = 'email' | 'google' | 'github' | 'oauth'

export type CustomerUser = {
  email: string
  name: string
  passwordHash?: string
  image?: string | null
  provider?: CustomerProvider
  createdAt: string
  updatedAt: string
  lastSeenAt?: string
}

type CustomerStoreData = {
  users: Record<string, CustomerUser>
}

function nowIso() {
  return new Date().toISOString()
}

function emptyStore(): CustomerStoreData {
  return { users: {} }
}

async function ensureStoreFile() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true })
  }

  if (!existsSync(STORE_FILE)) {
    await writeFile(STORE_FILE, JSON.stringify({ users: {} }, null, 2), 'utf-8')
  }
}

function normalizeEmail(email: string) {
  return email.toLowerCase().trim()
}

function sanitizeText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

function normalizeProvider(provider: unknown): CustomerProvider {
  return provider === 'google' || provider === 'github' || provider === 'email' || provider === 'oauth'
    ? provider
    : 'email'
}

function normalizeUser(emailKey: string, input: Partial<CustomerUser>): CustomerUser {
  const email = normalizeEmail(input.email || emailKey)
  const now = nowIso()
  return {
    email,
    name: sanitizeText(input.name, 100) || email.split('@')[0],
    passwordHash: sanitizeText(input.passwordHash, 220) || undefined,
    image: sanitizeText(input.image, 600) || null,
    provider: normalizeProvider(input.provider),
    createdAt: sanitizeText(input.createdAt, 40) || now,
    updatedAt: sanitizeText(input.updatedAt, 40) || now,
    lastSeenAt: sanitizeText(input.lastSeenAt, 40) || undefined,
  }
}

function normalizeStore(input: Partial<CustomerStoreData> | null | undefined): CustomerStoreData {
  const users: Record<string, CustomerUser> = {}
  const sourceUsers = input?.users && typeof input.users === 'object' ? input.users : {}

  for (const [email, user] of Object.entries(sourceUsers)) {
    const normalized = normalizeUser(email, user)
    users[normalized.email] = normalized
  }

  return { users }
}

async function readStore(): Promise<CustomerStoreData> {
  if (hasRuntimeKvStore()) {
    return normalizeStore(await readRuntimeJsonNoStore<CustomerStoreData>(RUNTIME_STORE_KEY))
  }

  await ensureStoreFile()

  try {
    const raw = await readFile(STORE_FILE, 'utf-8')
    return normalizeStore(JSON.parse(raw) as CustomerStoreData)
  } catch {
    return emptyStore()
  }
}

async function writeStore(data: CustomerStoreData) {
  if (hasRuntimeKvStore()) {
    await writeRuntimeJson(RUNTIME_STORE_KEY, normalizeStore(data))
    return
  }

  if (process.env.VERCEL) {
    throw new Error('Customer auth needs UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in production.')
  }

  await ensureStoreFile()
  await writeFile(STORE_FILE, JSON.stringify(normalizeStore(data), null, 2), 'utf-8')
}

async function mutateStore<T>(mutator: (store: CustomerStoreData) => T | Promise<T>) {
  return withRuntimeLock(RUNTIME_STORE_LOCK_KEY, async () => {
    const store = await readStore()
    const result = await mutator(store)
    await writeStore(store)
    return result
  })
}

export function isValidEmail(email: unknown): email is string {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer
  return `scrypt:${salt}:${derivedKey.toString('hex')}`
}

async function verifyPassword(password: string, passwordHash: string) {
  const [algorithm, salt, key] = passwordHash.split(':')

  if (algorithm !== 'scrypt' || !salt || !key) {
    return false
  }

  const storedKey = Buffer.from(key, 'hex')
  const derivedKey = (await scrypt(password, salt, storedKey.length)) as Buffer

  return storedKey.length === derivedKey.length && timingSafeEqual(storedKey, derivedKey)
}

export async function createCustomerUser(input: { name: string; email: string; password: string }) {
  const email = normalizeEmail(input.email)
  const passwordHash = await hashPassword(input.password)

  return mutateStore((store) => {
    const existing = store.users[email]
    if (existing?.passwordHash) {
      return { ok: false as const, error: 'Account already exists' }
    }

    const now = nowIso()
    const user: CustomerUser = {
      ...(existing || {}),
      email,
      name: input.name.trim() || existing?.name || email.split('@')[0],
      passwordHash,
      image: existing?.image || null,
      provider: 'email',
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      lastSeenAt: now,
    }

    store.users[email] = user
    return {
      ok: true as const,
      user: {
        email: user.email,
        name: user.name,
        image: user.image || null,
      },
    }
  })
}

export async function verifyCustomerCredentials(emailInput: string, password: string) {
  const store = await readStore()
  const email = normalizeEmail(emailInput)
  const user = store.users[email]
  const verifiedPasswordHash = user?.passwordHash

  if (!verifiedPasswordHash || !(await verifyPassword(password, verifiedPasswordHash))) {
    return null
  }

  return mutateStore((currentStore) => {
    const currentUser = currentStore.users[email]
    if (!currentUser || currentUser.passwordHash !== verifiedPasswordHash) return null

    const now = nowIso()
    currentUser.lastSeenAt = now
    currentUser.updatedAt = now
    currentStore.users[email] = currentUser

    return {
      email: currentUser.email,
      name: currentUser.name,
      image: currentUser.image || null,
    }
  })
}

export async function getCustomerUser(emailInput: string) {
  const store = await readStore()
  const email = normalizeEmail(emailInput)
  const user = store.users[email]

  if (!user) return null

  return {
    email: user.email,
    name: user.name,
    image: user.image || null,
    provider: user.provider || 'email',
    createdAt: user.createdAt,
    lastSeenAt: user.lastSeenAt || null,
  }
}

export async function upsertCustomerProfile(input: {
  email: string
  name?: string | null
  image?: string | null
  provider?: CustomerProvider
}) {
  const email = normalizeEmail(input.email)

  return mutateStore((store) => {
    const existing = store.users[email]
    const now = nowIso()
    const provider = input.provider || (existing?.provider && existing.provider !== 'email' ? existing.provider : 'oauth')
    const user: CustomerUser = {
      ...(existing || {}),
      email,
      name: sanitizeText(input.name, 100) || existing?.name || email.split('@')[0],
      passwordHash: existing?.passwordHash,
      image: sanitizeText(input.image, 600) || existing?.image || null,
      provider,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      lastSeenAt: now,
    }

    store.users[email] = user
    return {
      email: user.email,
      name: user.name,
      image: user.image || null,
      provider: user.provider || provider,
      createdAt: user.createdAt,
      lastSeenAt: user.lastSeenAt || null,
    }
  })
}

export async function updateCustomerPassword(emailInput: string, password: string) {
  const email = normalizeEmail(emailInput)
  const passwordHash = await hashPassword(password)

  return mutateStore((store) => {
    const user = store.users[email]
    if (!user) return false

    user.passwordHash = passwordHash
    user.provider = user.provider || 'email'
    user.updatedAt = nowIso()
    store.users[email] = user
    return true
  })
}

export async function getCustomerUsersForAdmin() {
  const store = await readStore()
  return Object.values(store.users)
    .map((user) => ({
      email: user.email,
      name: user.name,
      image: user.image || null,
      provider: user.provider || 'email',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastSeenAt: user.lastSeenAt || null,
      hasPassword: Boolean(user.passwordHash),
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}
