import 'server-only'

import { existsSync } from 'fs'
import { mkdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import type { NextRequest } from 'next/server'
import { hasRuntimeKvStore, readRuntimeJsonNoStore, withRuntimeLock, writeRuntimeJson } from '@/lib/runtime-kv'
import { getClientIp } from '@/lib/rate-limit'

const DATA_DIR = join(process.cwd(), 'data')
const STORE_FILE = join(DATA_DIR, 'auth-event-log.json')
const RUNTIME_STORE_KEY = 'mtverse:auth-event-log:v1'
const RUNTIME_STORE_LOCK_KEY = 'mtverse:lock:auth-event-log:v1'
const MAX_AUTH_EVENTS = 500

export type AuthEventType =
  | 'sign_in'
  | 'sign_up'
  | 'oauth_sign_in'
  | 'forgot_password'
  | 'reset_password'
  | 'sign_out'

export type AuthEventStatus = 'success' | 'failure' | 'blocked'
export type AuthEventProvider = 'email' | 'google' | 'github' | 'oauth' | 'unknown'

export type AuthEvent = {
  id: string
  type: AuthEventType
  status: AuthEventStatus
  provider: AuthEventProvider
  email: string | null
  reason: string
  message: string
  path: string | null
  ip: string | null
  country: string | null
  userAgent: string | null
  createdAt: string
}

type AuthEventStore = {
  events: AuthEvent[]
}

type RecordAuthEventInput = {
  request?: NextRequest
  type: AuthEventType
  status: AuthEventStatus
  provider?: AuthEventProvider | string | null
  email?: string | null
  reason: string
  message?: string | null
  errorId?: string
}

function normalizeEmail(email: unknown) {
  if (typeof email !== 'string') return null
  const normalized = email.toLowerCase().trim()
  if (!normalized || normalized.length > 254 || !normalized.includes('@')) return null
  return normalized
}

function sanitizeText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

function normalizeProvider(provider: unknown): AuthEventProvider {
  if (provider === 'email' || provider === 'google' || provider === 'github' || provider === 'oauth') {
    return provider
  }
  return 'unknown'
}

function normalizeStatus(status: unknown): AuthEventStatus {
  if (status === 'success' || status === 'failure' || status === 'blocked') return status
  return 'failure'
}

function normalizeType(type: unknown): AuthEventType {
  if (
    type === 'sign_in' ||
    type === 'sign_up' ||
    type === 'oauth_sign_in' ||
    type === 'forgot_password' ||
    type === 'reset_password' ||
    type === 'sign_out'
  ) {
    return type
  }
  return 'sign_in'
}

function createAuthEventId() {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14)
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `AUTH-${stamp}-${random}`
}

function emptyStore(): AuthEventStore {
  return { events: [] }
}

function normalizeEvent(input: Partial<Omit<AuthEvent, 'provider' | 'email'>> & { provider?: unknown; email?: unknown }): AuthEvent {
  const createdAt = sanitizeText(input.createdAt, 40) || new Date().toISOString()
  return {
    id: sanitizeText(input.id, 40) || createAuthEventId(),
    type: normalizeType(input.type),
    status: normalizeStatus(input.status),
    provider: normalizeProvider(input.provider),
    email: normalizeEmail(input.email),
    reason: sanitizeText(input.reason, 80) || 'unknown',
    message: sanitizeText(input.message, 240) || 'Authentication event recorded.',
    path: sanitizeText(input.path, 180) || null,
    ip: sanitizeText(input.ip, 80) || null,
    country: sanitizeText(input.country, 16) || null,
    userAgent: sanitizeText(input.userAgent, 220) || null,
    createdAt,
  }
}

function normalizeStore(input: Partial<AuthEventStore> | null | undefined): AuthEventStore {
  const events = Array.isArray(input?.events)
    ? input.events.map((event) => normalizeEvent(event)).slice(0, MAX_AUTH_EVENTS)
    : []

  return {
    events: events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  }
}

async function ensureStoreFile() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true })
  }

  if (!existsSync(STORE_FILE)) {
    await writeFile(STORE_FILE, JSON.stringify(emptyStore(), null, 2), 'utf-8')
  }
}

async function readStore(): Promise<AuthEventStore> {
  if (hasRuntimeKvStore()) {
    return normalizeStore(await readRuntimeJsonNoStore<AuthEventStore>(RUNTIME_STORE_KEY))
  }

  await ensureStoreFile()

  try {
    const raw = await readFile(STORE_FILE, 'utf-8')
    return normalizeStore(JSON.parse(raw) as AuthEventStore)
  } catch {
    return emptyStore()
  }
}

async function writeStore(store: AuthEventStore) {
  const payload = normalizeStore(store)

  if (hasRuntimeKvStore()) {
    await writeRuntimeJson(RUNTIME_STORE_KEY, payload)
    return
  }

  if (process.env.VERCEL) return

  await ensureStoreFile()
  await writeFile(STORE_FILE, JSON.stringify(payload, null, 2), 'utf-8')
}

function getRequestPath(request?: NextRequest) {
  if (!request) return null
  return `${request.nextUrl.pathname}${request.nextUrl.search || ''}`
}

function getRequestCountry(request?: NextRequest) {
  if (!request) return null
  return request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry') || null
}

function getRequestUserAgent(request?: NextRequest) {
  if (!request) return null
  return request.headers.get('user-agent')
}

export function createAuthErrorId() {
  return createAuthEventId()
}

export async function recordAuthEvent(input: RecordAuthEventInput) {
  const event = normalizeEvent({
    id: input.errorId || createAuthEventId(),
    type: input.type,
    status: input.status,
    provider: input.provider || undefined,
    email: input.email,
    reason: input.reason,
    message: input.message || input.reason,
    path: getRequestPath(input.request),
    ip: input.request ? getClientIp(input.request.headers) : null,
    country: getRequestCountry(input.request),
    userAgent: getRequestUserAgent(input.request),
    createdAt: new Date().toISOString(),
  })

  try {
    await withRuntimeLock(RUNTIME_STORE_LOCK_KEY, async () => {
      const store = await readStore()
      await writeStore({
        events: [event, ...store.events].slice(0, MAX_AUTH_EVENTS),
      })
    })
  } catch (error) {
    console.warn('Auth event logging failed:', error)
  }

  return event
}

export async function getAuthEventsForAdmin(limit = 200) {
  const store = await readStore()
  return store.events.slice(0, Math.max(1, Math.min(limit, MAX_AUTH_EVENTS)))
}
