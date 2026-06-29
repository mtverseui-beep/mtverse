import 'server-only'

import { getProductPackage, type PackageId } from './packages'

export type PaddleEnvironment = 'sandbox' | 'production'

export type PaddleCheckoutPayload = {
  environment: PaddleEnvironment
  clientToken: string
  priceId: string
  packageId: PackageId
  packageName: string
  amountUsd: number
  customerEmail?: string
  customData: Record<string, string>
}

const PADDLE_PRICE_ENV: Record<PackageId, string> = {
  next: 'PADDLE_NEXT_PRICE_ID',
}

function readEnv(name: string) {
  return process.env[name]?.trim() || ''
}

export function getPaddleEnvironment(): PaddleEnvironment {
  return process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'production' ? 'production' : 'sandbox'
}

export function getPaddlePriceId(packageId: PackageId) {
  return readEnv(PADDLE_PRICE_ENV[packageId])
}

export function createPaddleCheckoutPayload(packageId: PackageId, email?: string, kitSlug?: string): PaddleCheckoutPayload {
  const product = getProductPackage(packageId)
  const clientToken = readEnv('PADDLE_CLIENT_TOKEN')
  const priceId = getPaddlePriceId(packageId)

  if (!clientToken) {
    throw new Error('Paddle client token is missing. Set PADDLE_CLIENT_TOKEN in .env.local.')
  }

  if (!priceId) {
    throw new Error(`Paddle price ID is missing. Set ${PADDLE_PRICE_ENV[packageId]} in .env.local.`)
  }

  const customerEmail = email?.trim().toLowerCase()
  const safeKitSlug = kitSlug?.trim()

  return {
    environment: getPaddleEnvironment(),
    clientToken,
    priceId,
    packageId,
    packageName: product.name,
    amountUsd: product.amountUsd,
    customerEmail: customerEmail || undefined,
    customData: {
      packageId,
      accessPlan: product.accessPlan,
      packageName: product.name,
      source: 'mtverse-pricing',
      ...(safeKitSlug ? { kitSlug: safeKitSlug } : {}),
      ...(customerEmail ? { email: customerEmail } : {}),
    },
  }
}
