import 'server-only'

import { getProductPackage, isPackageId, type PackageId } from '@/lib/packages'
import { getPaddleEnvironment } from '@/lib/paddle'

type PaddleTransactionResponse = {
  data?: {
    id?: string
    status?: string
    customer_id?: string | null
    custom_data?: Record<string, unknown> | null
  }
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

function normalizeEmail(value: unknown) {
  const email = stringFromUnknown(value).toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : ''
}

function getPaddleApiBaseUrl() {
  return getPaddleEnvironment() === 'production'
    ? 'https://api.paddle.com'
    : 'https://sandbox-api.paddle.com'
}

export async function getVerifiedPaddleTransaction(transactionId: string): Promise<VerifiedPaddleTransaction | null> {
  const safeTransactionId = transactionId.trim()
  const apiKey = readEnv('PADDLE_API_KEY')
  if (!safeTransactionId || !apiKey) return null

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
  const packageId = stringFromUnknown(customData.packageId)
  const email = normalizeEmail(customData.email)
  if (!isPackageId(packageId) || !email) return null

  const product = getProductPackage(packageId)
  const kitSlug = stringFromUnknown(customData.kitSlug) || null
  const customerId = stringFromUnknown(transaction.customer_id) || undefined

  return {
    transactionId: safeTransactionId,
    packageId,
    plan: product.accessPlan,
    email,
    kitSlug,
    customerId,
  }
}