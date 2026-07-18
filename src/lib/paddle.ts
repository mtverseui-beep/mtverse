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

function readEnv(name: string) {
  return process.env[name]?.trim() || ''
}

function looksLikePaddleApiKey(value: string, environment: PaddleEnvironment) {
  const environmentPart = environment === 'production' ? 'live' : 'sdbx'
  return new RegExp(
    '^pdl_' + environmentPart + '_apikey_[a-z0-9]{26}_[A-Za-z0-9]{22}_[A-Za-z0-9]{3}$'
  ).test(value)
}

function looksLikePaddleWebhookSecret(value: string) {
  return /^pdl_ntfset_[A-Za-z0-9_+/=-]{32,}$/.test(value)
}

function looksLikePaddlePriceId(value: string) {
  return value.startsWith('pri_') && value.length >= 20
}

export function getPaddleEnvironment(): PaddleEnvironment {
  return process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'production' ? 'production' : 'sandbox'
}

export function getPaddlePriceId(packageId: PackageId) {
  return readEnv(PADDLE_PRICE_ENV[packageId])
}

export function getPaddleConfigurationStatus(packageId?: PackageId) {
  const environment = getPaddleEnvironment()
  const clientToken = readEnv('PADDLE_CLIENT_TOKEN')
  const apiKey = readEnv('PADDLE_API_KEY')
  const webhookSecret = readEnv('PADDLE_WEBHOOK_SECRET')
  const issues: string[] = []
  const provider = process.env.PAYMENT_PROVIDER?.trim() || 'mock'
  const expectedClientPrefix = environment === 'production' ? 'live_' : 'test_'
  const expectedApiPrefix = environment === 'production' ? 'pdl_live_' : 'pdl_sdbx_'

  if (provider !== 'paddle') {
    issues.push('PAYMENT_PROVIDER must be set to paddle.')
  }
  if (!clientToken.startsWith(expectedClientPrefix)) {
    issues.push('PADDLE_CLIENT_TOKEN must be a ' + environment + ' token starting with ' + expectedClientPrefix + '.')
  }
  if (!looksLikePaddleApiKey(apiKey, environment) || !apiKey.startsWith(expectedApiPrefix)) {
    issues.push('PADDLE_API_KEY must be a ' + environment + ' API key starting with ' + expectedApiPrefix + '.')
  }
  if (!looksLikePaddleWebhookSecret(webhookSecret)) {
    issues.push('PADDLE_WEBHOOK_SECRET must be the endpoint secret key starting with pdl_ntfset_.')
  }

  const priceEntries = packageId
    ? [[packageId, PADDLE_PRICE_ENV[packageId]] as [PackageId, string]]
    : (Object.entries(PADDLE_PRICE_ENV) as Array<[PackageId, string]>)

  for (const [currentPackageId, envName] of priceEntries) {
    if (!looksLikePaddlePriceId(readEnv(envName))) {
      issues.push(envName + ' is missing or is not a Paddle price ID for ' + currentPackageId + '.')
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
  const configuration = getPaddleConfigurationStatus(packageId)
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
    throw new Error(`Paddle price ID is missing. Set ${PADDLE_PRICE_ENV[packageId]} in your environment.`)
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
