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

function readFirstEnv(names: string[]) {
  for (const name of names) {
    const value = readEnv(name)
    if (value) return value
  }
  return ''
}

function getScopedPaddleEnvName(name: string, environment: PaddleEnvironment) {
  const scope = environment === 'production' ? 'PRODUCTION' : 'SANDBOX'

  if (name.startsWith('NEXT_PUBLIC_PADDLE_')) {
    return name.replace('NEXT_PUBLIC_PADDLE_', `NEXT_PUBLIC_PADDLE_${scope}_`)
  }

  if (name.startsWith('PADDLE_')) {
    return name.replace('PADDLE_', `PADDLE_${scope}_`)
  }

  return name
}

function getPaddleEnvNames(name: string, environment: PaddleEnvironment) {
  const scopedName = getScopedPaddleEnvName(name, environment)
  return scopedName === name ? [name] : [scopedName, name]
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

function getPaddlePriceEnvNames(packageId: PackageId, environment = getPaddleEnvironment()) {
  const baseNames = [PADDLE_PRICE_ENV[packageId], ...(PADDLE_PRICE_ENV_ALIASES[packageId] || [])]
  return Array.from(new Set(baseNames.flatMap((name) => getPaddleEnvNames(name, environment))))
}

export function getPaddlePriceId(packageId: PackageId) {
  return readFirstEnv(getPaddlePriceEnvNames(packageId))
}

export function getPaddleConfigurationStatus(
  packageId?: PackageId,
  options: { requireWebhookSecret?: boolean } = {},
) {
  const environment = getPaddleEnvironment()
  const clientTokenNames = getPaddleEnvNames('PADDLE_CLIENT_TOKEN', environment)
  const apiKeyNames = getPaddleEnvNames('PADDLE_API_KEY', environment)
  const webhookSecretNames = getPaddleEnvNames('PADDLE_WEBHOOK_SECRET', environment)
  const clientToken = readFirstEnv(clientTokenNames)
  const apiKey = readFirstEnv(apiKeyNames)
  const webhookSecret = readFirstEnv(webhookSecretNames)
  const issues: string[] = []
  const provider = process.env.PAYMENT_PROVIDER?.trim() || 'mock'
  const expectedClientPrefix = environment === 'production' ? 'live_' : 'test_'
  const expectedApiPrefix = environment === 'production' ? 'pdl_live_' : 'pdl_sdbx_'
  const requireWebhookSecret = options.requireWebhookSecret ?? true

  if (provider !== 'paddle') {
    issues.push('PAYMENT_PROVIDER must be set to paddle.')
  }
  if (!clientToken.startsWith(expectedClientPrefix)) {
    issues.push(clientTokenNames.join(' or ') + ' must be a ' + environment + ' token starting with ' + expectedClientPrefix + '.')
  }
  if (!looksLikePaddleApiKey(apiKey, environment) || !apiKey.startsWith(expectedApiPrefix)) {
    issues.push(apiKeyNames.join(' or ') + ' must be a ' + environment + ' API key starting with ' + expectedApiPrefix + '.')
  }
  if (requireWebhookSecret && !looksLikePaddleWebhookSecret(webhookSecret)) {
    issues.push(webhookSecretNames.join(' or ') + ' must be the endpoint secret key starting with pdl_ntfset_.')
  }

  const packageIds = packageId
    ? [packageId]
    : (Object.keys(PADDLE_PRICE_ENV) as PackageId[])

  for (const currentPackageId of packageIds) {
    const envNames = getPaddlePriceEnvNames(currentPackageId, environment)
    if (!looksLikePaddlePriceId(readFirstEnv(envNames))) {
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
  const environment = getPaddleEnvironment()
  const clientToken = readFirstEnv(getPaddleEnvNames('PADDLE_CLIENT_TOKEN', environment))
  const priceId = getPaddlePriceId(packageId)

  if (!clientToken) {
    throw new Error('Paddle client token is missing. Set ' + getPaddleEnvNames('PADDLE_CLIENT_TOKEN', environment).join(' or ') + ' in your environment.')
  }

  if (!priceId) {
    throw new Error(`Paddle price ID is missing. Set ${getPaddlePriceEnvNames(packageId, environment).join(' or ')} in your environment.`)
  }

  const customerEmail = email?.trim().toLowerCase()
  const safeKitSlug = kitSlug?.trim()
  const checkoutIntent = customerEmail
    ? createCheckoutIntentData({ email: customerEmail, packageId, kitSlug: safeKitSlug || null })
    : null

  return {
    environment,
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
