import 'server-only'

import { verifyCheckoutIntentData } from '@/lib/checkout-intent'
import { getProductPackage, isPackageId, type PackageId } from '@/lib/packages'
import { getPaddleEnvironment, getPaddlePriceId } from '@/lib/paddle'
import { getRedisClient, hasRuntimeKvStore } from '@/lib/runtime-kv'

type PaddleTransactionResponse = {
  data?: PaddleTransactionLike
}

export type PaddleTransactionLike = {
  id?: string
  status?: string
  customer_id?: string | null
  custom_data?: Record<string, unknown> | null
  details?: {
    line_items?: Array<{
      price_id?: string
      quantity?: number
    }>
  } | null
}

export type VerifiedPaddleTransaction = {
  transactionId: string
  packageId: PackageId
  plan: ReturnType<typeof getProductPackage>['accessPlan']
  email: string
  kitSlug: string | null
  customerId?: string
}

function readEnv(name: string) {
  return process.env[name]?.trim() || ''
}

function stringFromUnknown(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}


function getPaddleApiBaseUrl() {
  return getPaddleEnvironment() === 'production'
    ? 'https://api.paddle.com'
    : 'https://sandbox-api.paddle.com'
}

export function hasExpectedPaddlePrice(
  transaction: PaddleTransactionLike | null | undefined,
  packageId: PackageId,
) {
  const expectedPriceId = getPaddlePriceId(packageId)
  const lineItems = transaction?.details?.line_items

  return Boolean(
    expectedPriceId &&
    Array.isArray(lineItems) &&
    lineItems.length === 1 &&
    lineItems[0]?.price_id === expectedPriceId &&
    lineItems[0]?.quantity === 1
  )
}

export async function getVerifiedPaddleTransaction(transactionId: string): Promise<VerifiedPaddleTransaction | null> {
  const safeTransactionId = transactionId.trim()
  const apiKey = readEnv('PADDLE_API_KEY')
  if (!safeTransactionId || !apiKey) return null
  const cacheKey = 'paddle:verified-transaction:' + safeTransactionId

  if (hasRuntimeKvStore()) {
    try {
      const cached = await getRedisClient().get(cacheKey)
      if (cached) {
        const value = JSON.parse(cached) as Partial<VerifiedPaddleTransaction>
        if (
          value.transactionId === safeTransactionId &&
          isPackageId(value.packageId) &&
          typeof value.email === 'string' &&
          value.email.includes('@')
        ) {
          return {
            transactionId: safeTransactionId,
            packageId: value.packageId,
            plan: getProductPackage(value.packageId).accessPlan,
            email: value.email.toLowerCase().trim(),
            kitSlug: typeof value.kitSlug === 'string' ? value.kitSlug : null,
            customerId: typeof value.customerId === 'string' ? value.customerId : undefined,
          }
        }
      }
    } catch (error) {
      console.warn('[Paddle] Verified transaction cache read failed.', error)
    }
  }

  const response = await fetch(`${getPaddleApiBaseUrl()}/transactions/${encodeURIComponent(safeTransactionId)}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  })

  if (!response.ok) return null

  const payload = (await response.json()) as PaddleTransactionResponse
  const transaction = payload.data
  if (!transaction || transaction.id !== safeTransactionId) return null

  const status = stringFromUnknown(transaction.status).toLowerCase()
  if (status !== 'completed' && status !== 'paid') return null

  const customData = transaction.custom_data || {}
  const intent = verifyCheckoutIntentData(customData)
  if (!intent) return null
  if (!hasExpectedPaddlePrice(transaction, intent.packageId)) return null

  const product = getProductPackage(intent.packageId)
  const customerId = stringFromUnknown(transaction.customer_id) || undefined

  const verified: VerifiedPaddleTransaction = {
    transactionId: safeTransactionId,
    packageId: intent.packageId,
    plan: product.accessPlan,
    email: intent.email,
    kitSlug: intent.kitSlug,
    customerId,
  }

  if (hasRuntimeKvStore()) {
    await getRedisClient().setex(cacheKey, 5 * 60, JSON.stringify(verified)).catch((error) => {
      console.warn('[Paddle] Verified transaction cache write failed.', error)
    })
  }

  return verified
}
