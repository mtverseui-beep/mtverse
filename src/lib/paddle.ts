import 'server-only'

import { createCheckoutIntentData } from './checkout-intent'
import { getProductPackage, type PackageId } from './packages'
import type { PaddleCheckoutPayload, PaddleEnvironment } from '@/lib/paddle-types'
export type { PaddleCheckoutPayload, PaddleEnvironment } from '@/lib/paddle-types'

const PADDLE_PRICE_ENV: Record<PackageId, string> = {
  next: 'PADDLE_NEXT_PRICE_ID',
  pro: 'PADDLE_PRO_PRICE_ID',
  'ooster-pro': 'PADDLE_OOSTER_PRO_PRICE_ID',
  'free-unlock': 'PADDLE_FREE_UNLOCK_PRICE_ID',
  'all-paid': 'PADDLE_ALL_PAID_PRICE_ID',
  'ui-library': 'PADDLE_UI_LIBRARY_PRICE_ID',
}

const PADDLE_PRICE_ENV_ALIASES: Partial<Record<PackageId, string[]>> = {
  'ui-library': ['NEXT_PUBLIC_PADDLE_UI_LIBRARY_PRICE_ID', 'PADDLE_UI_LIB_PRICE_ID'],
}

function readEnv(name: string) {
  return process.env[name]?.trim() || ''
}

function looksLikePaddleApiKey(value: string, environment: PaddleEnvironment) {
  const expectedPrefix = environment === 'production' ? 'pdl_live_' : 'pdl_sdbx_'
  return value.startsWith(expectedPrefix) && value.includes('_apikey_') && value.length >= 40
}

function looksLikePaddleWebhookSecret(value: string) {
  return value.startsWith('pdl_ntfset_') && value.length >= 32
}

function looksLikePaddlePriceId(value: string) {
  return value.startsWith('pri_') && value.length >= 20
}

export function getPaddleEnvironment(): PaddleEnvironment {
  return process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'production' ? 'production' : 'sandbox'
}

function getPaddlePriceEnvNames(packageId: PackageId) {
  return [PADDLE_PRICE_ENV[packageId], ...(PADDLE_PRICE_ENV_ALIASES[packageId] || [])]
}

export function getPaddlePriceId(packageId: PackageId) {
  for (const envName of getPaddlePriceEnvNames(packageId)) {
    const value = readEnv(envName)
    if (value) return value
  }
  return ''
}

export function getPaddleConfigurationStatus(
  packageId?: PackageId,
  options: { requireWebhookSecret?: boolean } = {},
) {
  const environment = getPaddleEnvironment()
  const clientToken = readEnv('PADDLE_CLIENT_TOKEN')
  const apiKey = readEnv('PADDLE_API_KEY')
  const webhookSecret = readEnv('PADDLE_WEBHOOK_SECRET')
  const issues: string[] = []
  const provider = process.env.PAYMENT_PROVIDER?.trim() || 'mock'
  const expectedClientPrefix = environment === 'production' ? 'live_' : 'test_'
  const expectedApiPrefix = environment === 'production' ? 'pdl_live_' : 'pdl_sdbx_'
  const requireWebhookSecret = options.requireWebhookSecret ?? true

  if (provider !== 'paddle') {
    issues.push('PAYMENT_PROVIDER must be set to paddle.')
  }
  if (!clientToken.startsWith(expectedClientPrefix)) {
    issues.push('PADDLE_CLIENT_TOKEN must be a ' + environment + ' token starting with ' + expectedClientPrefix + '.')
  }
  if (!looksLikePaddleApiKey(apiKey, environment) || !apiKey.startsWith(expectedApiPrefix)) {
    issues.push('PADDLE_API_KEY must be a ' + environment + ' API key starting with ' + expectedApiPrefix + '.')
  }
  if (requireWebhookSecret && !looksLikePaddleWebhookSecret(webhookSecret)) {
    issues.push('PADDLE_WEBHOOK_SECRET must be the endpoint secret key starting with pdl_ntfset_.')
  }

  const packageIds = packageId
    ? [packageId]
    : (Object.keys(PADDLE_PRICE_ENV) as PackageId[])

  for (const currentPackageId of packageIds) {
    const envNames = getPaddlePriceEnvNames(currentPackageId)
    if (!looksLikePaddlePriceId(getPaddlePriceId(currentPackageId))) {
      issues.push(envNames.join(' or ') + ' is missing or is not a Paddle price ID for ' + currentPackageId + '.')
    }
  }

  return {
    ready: issues.length === 0,
    environment,
    provider,
    issues,
  }
}

export function createPaddleCheckoutPayload(packageId: PackageId, email?: string, kitSlug?: string): PaddleCheckoutPayload {
  const configuration = getPaddleConfigurationStatus(packageId, { requireWebhookSecret: false })
  if (!configuration.ready) {
    throw new Error('Paddle checkout configuration is incomplete: ' + configuration.issues.join(' '))
  }

  const product = getProductPackage(packageId)
  const clientToken = readEnv('PADDLE_CLIENT_TOKEN')
  const priceId = getPaddlePriceId(packageId)

  if (!clientToken) {
    throw new Error('Paddle client token is missing. Set PADDLE_CLIENT_TOKEN in .env.local.')
  }

  if (!priceId) {
    throw new Error(`Paddle price ID is missing. Set ${getPaddlePriceEnvNames(packageId).join(' or ')} in your environment.`)
  }

  const customerEmail = email?.trim().toLowerCase()
  const safeKitSlug = kitSlug?.trim()
  const checkoutIntent = customerEmail
    ? createCheckoutIntentData({ email: customerEmail, packageId, kitSlug: safeKitSlug || null })
    : null

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
      ...(checkoutIntent || {}),
    },
  }
}

