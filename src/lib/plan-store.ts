import { readFile, writeFile, mkdir } from 'fs/promises'
import crypto from 'crypto'
import { existsSync } from 'fs'
import { join } from 'path'
import type { PlanLevel } from './plan-access'
import { hasRuntimeKvStore, readRuntimeJsonNoStore, withRuntimeLock, writeRuntimeJson } from '@/lib/runtime-kv'

const DATA_DIR = join(process.cwd(), 'data')
const STORE_FILE = join(DATA_DIR, 'plan-store.json')
const RUNTIME_STORE_KEY = 'mtverse:plan-store:v1'
const RUNTIME_STORE_LOCK_KEY = 'mtverse:lock:plan-store:v1'

export type PlanStatus = 'active' | 'revoked'

interface PlanRecord {
  email: string
  plan: PlanLevel
  licenseKey: string
  status?: PlanStatus
  provider?: string
  providerTransactionId?: string
  providerTransactionIds?: string[]
  providerCustomerId?: string
  packageId?: string
  purchases?: string[]
  createdAt: string
  updatedAt: string
}

interface PlanStoreData {
  plans: Record<string, PlanRecord>
  licenses: Record<string, string> // licenseKey -> email
}

function emptyStore(): PlanStoreData {
  return { plans: {}, licenses: {} }
}

const PLAN_RANK: Record<PlanLevel, number> = {
  free: 0,
  pro: 1,
  business: 2,
  extended: 3,
}

function resolvePlanLevel(incoming: PlanLevel, existing?: PlanLevel): PlanLevel {
  if (!existing) return incoming
  return PLAN_RANK[incoming] >= PLAN_RANK[existing] ? incoming : existing
}

function normalizePackageId(value: string | undefined) {
  return value?.trim() || undefined
}

function mergePurchaseIds(existing: PlanRecord | undefined, incomingPackageId: string | undefined) {
  const purchases = new Set<string>()
  for (const value of existing?.purchases || []) {
    const normalized = normalizePackageId(value)
    if (normalized) purchases.add(normalized)
  }
  const existingPackageId = normalizePackageId(existing?.packageId)
  if (existingPackageId) purchases.add(existingPackageId)
  const incoming = normalizePackageId(incomingPackageId)
  if (incoming) purchases.add(incoming)
  return Array.from(purchases)
}

function mergeTransactionIds(existing: PlanRecord | undefined, incomingTransactionId: string | undefined) {
  const transactionIds = new Set<string>()
  for (const value of existing?.providerTransactionIds || []) {
    const normalized = value.trim()
    if (normalized) transactionIds.add(normalized)
  }
  if (existing?.providerTransactionId?.trim()) transactionIds.add(existing.providerTransactionId.trim())
  if (incomingTransactionId?.trim()) transactionIds.add(incomingTransactionId.trim())
  return Array.from(transactionIds)
}

function resolvePackageId(existing: PlanRecord | undefined, incomingPackageId: string | undefined) {
  const existingPackageId = normalizePackageId(existing?.packageId)
  const incoming = normalizePackageId(incomingPackageId)
  if (existingPackageId === 'all-paid') return existingPackageId
  if (incoming === 'all-paid') return incoming
  return incoming || existingPackageId
}

export function hasPlanPackageAccess(record: PlanRecord | null | undefined, packageId: string) {
  if (!record || record.status === 'revoked') return false
  if (record.packageId === 'all-paid') return true
  if (record.packageId === packageId) return true
  return Boolean(record.purchases?.includes(packageId))
}

async function ensureStoreFile(): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true })
  }
  if (!existsSync(STORE_FILE)) {
    await writeFile(STORE_FILE, JSON.stringify({ plans: {}, licenses: {} }, null, 2), 'utf-8')
  }
}

async function readStore(): Promise<PlanStoreData> {
  if (hasRuntimeKvStore()) {
    return (await readRuntimeJsonNoStore<PlanStoreData>(RUNTIME_STORE_KEY)) || emptyStore()
  }

  await ensureStoreFile()
  try {
    const raw = await readFile(STORE_FILE, 'utf-8')
    return JSON.parse(raw) as PlanStoreData
  } catch {
    return emptyStore()
  }
}

async function writeStore(data: PlanStoreData): Promise<void> {
  if (hasRuntimeKvStore()) {
    await writeRuntimeJson(RUNTIME_STORE_KEY, data)
    return
  }

  if (process.env.VERCEL) {
    throw new Error('Plan storage needs UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in production.')
  }

  await ensureStoreFile()
  await writeFile(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

async function mutateStore<T>(mutator: (store: PlanStoreData) => T | Promise<T>): Promise<T> {
  return withRuntimeLock(RUNTIME_STORE_LOCK_KEY, async () => {
    const store = await readStore()
    const result = await mutator(store)
    await writeStore(store)
    return result
  })
}

/**
 * Generate a simple license key
 */
function generateLicenseKey(): string {
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const segments: string[] = []
  for (let s = 0; s < 4; s++) {
    const bytes = crypto.randomBytes(4)
    let segment = ''
    for (let i = 0; i < 4; i++) {
      segment += chars.charAt(bytes[i] % chars.length)
    }
    segments.push(segment)
  }
  return `MTV-${segments.join('-')}`
}

/**
 * Get the plan for a given email
 */
export async function getPlan(email: string): Promise<PlanRecord | null> {
  const store = await readStore()
  const normalizedEmail = email.toLowerCase().trim()
  const record = store.plans[normalizedEmail] ?? null
  if (record?.status === 'revoked') return null
  return record
}

export async function getAllPlans(): Promise<PlanRecord[]> {
  const store = await readStore()
  return Object.values(store.plans).sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
}

export async function getPlanByProviderTransactionId(transactionId: string): Promise<PlanRecord | null> {
  const store = await readStore()
  const safeTransactionId = transactionId.trim()
  if (!safeTransactionId) return null

  return Object.values(store.plans).find((record) =>
    record.providerTransactionId === safeTransactionId ||
    record.providerTransactionIds?.includes(safeTransactionId)
  ) ?? null
}

/**
 * Set the plan for a given email. Creates a license key if not provided.
 */
export async function setPlan(
  email: string,
  plan: PlanLevel,
  licenseKey?: string,
  providerTransactionId?: string,
  providerCustomerId?: string,
  provider?: string,
  packageId?: string
): Promise<PlanRecord> {
  const normalizedEmail = email.toLowerCase().trim()

  return mutateStore((store) => {
    const existing = store.plans[normalizedEmail]
    const key = licenseKey || existing?.licenseKey || generateLicenseKey()
    const now = new Date().toISOString()

    const record: PlanRecord = {
      email: normalizedEmail,
      plan: resolvePlanLevel(plan, existing?.plan),
      licenseKey: key,
      status: 'active',
      provider: provider || existing?.provider,
      providerTransactionId: providerTransactionId || existing?.providerTransactionId,
      providerTransactionIds: mergeTransactionIds(existing, providerTransactionId),
      providerCustomerId: providerCustomerId || existing?.providerCustomerId,
      packageId: resolvePackageId(existing, packageId),
      purchases: mergePurchaseIds(existing, packageId),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    }

    store.plans[normalizedEmail] = record
    store.licenses[key] = normalizedEmail
    return record
  })
}

/**
 * Revoke the plan for a given email
 */
export async function revokePlan(email: string): Promise<boolean> {
  const normalizedEmail = email.toLowerCase().trim()
  return mutateStore((store) => {
    const existing = store.plans[normalizedEmail]
    if (!existing) return false

    existing.status = 'revoked'
    existing.updatedAt = new Date().toISOString()
    store.plans[normalizedEmail] = existing
    return true
  })
}

export async function restorePlan(email: string): Promise<boolean> {
  const normalizedEmail = email.toLowerCase().trim()
  return mutateStore((store) => {
    const existing = store.plans[normalizedEmail]
    if (!existing) return false

    existing.status = 'active'
    existing.updatedAt = new Date().toISOString()
    store.plans[normalizedEmail] = existing
    store.licenses[existing.licenseKey] = normalizedEmail
    return true
  })
}

/**
 * Look up a license by key
 */
export async function getLicenseByKey(licenseKey: string): Promise<PlanRecord | null> {
  const store = await readStore()
  const email = store.licenses[licenseKey]
  if (!email) return null
  return store.plans[email] ?? null
}

/**
 * Verify and activate a license key for a given email
 */
export async function activateLicense(
  licenseKey: string,
  email: string
): Promise<{ success: boolean; plan?: PlanLevel; error?: string }> {
  const normalizedEmail = email.toLowerCase().trim()

  return mutateStore((store) => {
    const linkedEmail = store.licenses[licenseKey]
    if (!linkedEmail) return { success: false, error: 'Invalid license key' }

    const record = store.plans[linkedEmail]
    if (!record) return { success: false, error: 'License record not found' }
    if (record.status === 'revoked') return { success: false, error: 'License has been revoked' }
    if (linkedEmail === normalizedEmail) return { success: true, plan: record.plan }

    delete store.plans[linkedEmail]
    record.email = normalizedEmail
    record.updatedAt = new Date().toISOString()
    store.plans[normalizedEmail] = record
    store.licenses[licenseKey] = normalizedEmail
    return { success: true, plan: record.plan }
  })
}
