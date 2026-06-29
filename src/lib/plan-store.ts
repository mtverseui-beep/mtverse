import { readFile, writeFile, mkdir } from 'fs/promises'
import crypto from 'crypto'
import { existsSync } from 'fs'
import { join } from 'path'
import type { PlanLevel } from './plan-access'
import { hasRuntimeKvStore, readRuntimeJsonNoStore, writeRuntimeJson } from '@/lib/runtime-kv'

const DATA_DIR = join(process.cwd(), 'data')
const STORE_FILE = join(DATA_DIR, 'plan-store.json')
const RUNTIME_STORE_KEY = 'mtverse:plan-store:v1'

export type PlanStatus = 'active' | 'revoked'

interface PlanRecord {
  email: string
  plan: PlanLevel
  licenseKey: string
  status?: PlanStatus
  provider?: string
  providerTransactionId?: string
  providerCustomerId?: string
  packageId?: string
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

  return Object.values(store.plans).find(record => record.providerTransactionId === safeTransactionId) ?? null
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
  const store = await readStore()
  const normalizedEmail = email.toLowerCase().trim()
  const existing = store.plans[normalizedEmail]

  const key = licenseKey || existing?.licenseKey || generateLicenseKey()
  const now = new Date().toISOString()

  const record: PlanRecord = {
    email: normalizedEmail,
    plan,
    licenseKey: key,
    status: 'active',
    provider: provider || existing?.provider,
    providerTransactionId: providerTransactionId || existing?.providerTransactionId,
    providerCustomerId: providerCustomerId || existing?.providerCustomerId,
    packageId: packageId || existing?.packageId,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  }

  store.plans[normalizedEmail] = record
  store.licenses[key] = normalizedEmail

  await writeStore(store)
  return record
}

/**
 * Revoke the plan for a given email
 */
export async function revokePlan(email: string): Promise<boolean> {
  const store = await readStore()
  const normalizedEmail = email.toLowerCase().trim()
  const existing = store.plans[normalizedEmail]

  if (!existing) return false

  existing.status = 'revoked'
  existing.updatedAt = new Date().toISOString()
  store.plans[normalizedEmail] = existing

  await writeStore(store)
  return true
}

export async function restorePlan(email: string): Promise<boolean> {
  const store = await readStore()
  const normalizedEmail = email.toLowerCase().trim()
  const existing = store.plans[normalizedEmail]

  if (!existing) return false

  existing.status = 'active'
  existing.updatedAt = new Date().toISOString()
  store.plans[normalizedEmail] = existing
  store.licenses[existing.licenseKey] = normalizedEmail

  await writeStore(store)
  return true
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
  const store = await readStore()
  const linkedEmail = store.licenses[licenseKey]

  if (!linkedEmail) {
    return { success: false, error: 'Invalid license key' }
  }

  const record = store.plans[linkedEmail]
  if (!record) {
    return { success: false, error: 'License record not found' }
  }

  if (record.status === 'revoked') {
    return { success: false, error: 'License has been revoked' }
  }

  // Allow activation if the license is associated with this email
  // or if it's a new activation (link the license to the provided email)
  const normalizedEmail = email.toLowerCase().trim()

  if (linkedEmail === normalizedEmail) {
    return { success: true, plan: record.plan }
  }

  // Transfer license to new email
  delete store.plans[linkedEmail]
  record.email = normalizedEmail
  record.updatedAt = new Date().toISOString()
  store.plans[normalizedEmail] = record
  store.licenses[licenseKey] = normalizedEmail

  await writeStore(store)
  return { success: true, plan: record.plan }
}
