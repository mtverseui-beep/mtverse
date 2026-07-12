import 'server-only'

import { createHmac, timingSafeEqual } from 'node:crypto'
import { isPackageId, type PackageId } from '@/lib/packages'

const CHECKOUT_INTENT_VERSION = '1'
const CHECKOUT_INTENT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

export type VerifiedCheckoutIntent = {
  email: string
  packageId: PackageId
  kitSlug: string | null
  issuedAt: number
}

function readSigningSecret() {
  const customerSecret = process.env.CUSTOMER_SESSION_SECRET?.trim()
  if (customerSecret) return customerSecret
  if (process.env.NODE_ENV !== 'production') return process.env.NEXTAUTH_SECRET?.trim() || ''
  return ''
}

function normalizeEmail(value: unknown) {
  const email = typeof value === 'string' ? value.trim().toLowerCase() : ''
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : ''
}

function normalizeKitSlug(value: unknown) {
  const slug = typeof value === 'string' ? value.trim() : ''
  return slug || null
}

function canonicalIntentPayload(email: string, packageId: PackageId, kitSlug: string | null, issuedAt: number) {
  return [CHECKOUT_INTENT_VERSION, email, packageId, kitSlug || '', String(issuedAt)].join('\n')
}

function signIntent(email: string, packageId: PackageId, kitSlug: string | null, issuedAt: number) {
  const secret = readSigningSecret()
  if (!secret) {
    throw new Error('Checkout intent signing secret is missing.')
  }

  return createHmac('sha256', secret)
    .update(canonicalIntentPayload(email, packageId, kitSlug, issuedAt))
    .digest('hex')
}

function safeEqual(left: string, right: string) {
  try {
    const leftBuffer = Buffer.from(left, 'hex')
    const rightBuffer = Buffer.from(right, 'hex')
    return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
  } catch {
    return false
  }
}

export function createCheckoutIntentData(input: { email: string; packageId: PackageId; kitSlug?: string | null }) {
  const email = normalizeEmail(input.email)
  if (!email) throw new Error('Checkout intent requires a valid signed-in customer email.')

  const kitSlug = normalizeKitSlug(input.kitSlug)
  const issuedAt = Date.now()
  const signature = signIntent(email, input.packageId, kitSlug, issuedAt)

  return {
    checkoutIntentVersion: CHECKOUT_INTENT_VERSION,
    checkoutIntentIssuedAt: String(issuedAt),
    checkoutIntentSignature: signature,
  }
}

export function verifyCheckoutIntentData(customData: Record<string, unknown> | null | undefined): VerifiedCheckoutIntent | null {
  if (!customData || customData.checkoutIntentVersion !== CHECKOUT_INTENT_VERSION) return null

  const email = normalizeEmail(customData.email)
  const rawPackageId = typeof customData.packageId === 'string' ? customData.packageId.trim() : ''
  const kitSlug = normalizeKitSlug(customData.kitSlug)
  const issuedAt = Number(customData.checkoutIntentIssuedAt)
  const signature = typeof customData.checkoutIntentSignature === 'string' ? customData.checkoutIntentSignature.trim() : ''

  if (!email || !isPackageId(rawPackageId) || !Number.isFinite(issuedAt) || !signature) return null
  if (Date.now() - issuedAt > CHECKOUT_INTENT_MAX_AGE_MS) return null

  const expected = signIntent(email, rawPackageId, kitSlug, issuedAt)
  if (!safeEqual(expected, signature)) return null

  return {
    email,
    packageId: rawPackageId,
    kitSlug,
    issuedAt,
  }
}
