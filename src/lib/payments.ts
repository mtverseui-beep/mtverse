import 'server-only'

import { createPaddleCheckoutPayload, type PaddleCheckoutPayload } from './paddle'
import { getProductPackage, isPackageId, type PackageId } from './packages'

export type PaymentProvider = 'mock' | 'paddle' | 'razorpay'

export type CheckoutInput = {
  packageId: PackageId
  email?: string
  kitSlug?: string
}

export type CheckoutResult = {
  url?: string
  provider: PaymentProvider
  mock: boolean
  paddle?: PaddleCheckoutPayload
}

export type VerifyPaymentResult = {
  valid: boolean
  provider: PaymentProvider
  plan: ReturnType<typeof getProductPackage>['accessPlan'] | null
  packageId: PackageId | null
  email: string | null
  mock: boolean
  error?: string
}

function normalizeProvider(value: string | undefined): PaymentProvider {
  if (value === 'paddle' || value === 'razorpay') return value
  return 'mock'
}

export function getPaymentProvider(): PaymentProvider {
  return normalizeProvider(process.env.PAYMENT_PROVIDER)
}

export function isMockPaymentAllowed() {
  return process.env.NODE_ENV === 'development'
}

function buildMockSuccessUrl(packageId: PackageId, email?: string, kitSlug?: string) {
  const product = getProductPackage(packageId)
  const params = new URLSearchParams({
    package: packageId,
    plan: product.accessPlan,
    provider: 'mock',
    mock: 'true',
  })

  if (email) params.set('email', email)
  if (kitSlug) params.set('kit', kitSlug)

  return `/pricing/success?${params.toString()}`
}

export async function createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const provider = getPaymentProvider()

  if (provider === 'mock') {
    if (!isMockPaymentAllowed()) {
      throw new Error('Payment provider is not configured for production.')
    }

    return {
      url: buildMockSuccessUrl(input.packageId, input.email, input.kitSlug),
      provider,
      mock: true,
    }
  }

  if (provider === 'paddle') {
    return {
      provider,
      mock: false,
      paddle: createPaddleCheckoutPayload(input.packageId, input.email, input.kitSlug),
    }
  }

  // Razorpay can be added later without changing the pricing page contract.
  // Keeping this explicit prevents accidentally launching paid traffic on mock URLs.
  if (process.env.NODE_ENV === 'production') {
    throw new Error(`${provider} checkout is not configured yet`)
  }

  return {
    url: buildMockSuccessUrl(input.packageId, input.email, input.kitSlug),
    provider: 'mock',
    mock: true,
  }
}

export function verifyPaymentFromSearchParams(searchParams: URLSearchParams): VerifyPaymentResult {
  const packageParam = searchParams.get('package')
  const provider = normalizeProvider(searchParams.get('provider') || undefined)
  const safePackage = isPackageId(packageParam) ? packageParam : null
  const product = safePackage ? getProductPackage(safePackage) : null
  const email = searchParams.get('email')
  const isMock = provider === 'mock' || searchParams.get('mock') === 'true'

  if (isMock && !isMockPaymentAllowed()) {
    return {
      valid: false,
      provider,
      plan: null,
      packageId: null,
      email: null,
      mock: true,
      error: 'Mock payments are disabled.',
    }
  }

  if (!product) {
    return {
      valid: false,
      provider,
      plan: null,
      packageId: null,
      email: null,
      mock: provider === 'mock',
      error: 'Invalid or missing package',
    }
  }

  return {
    valid: true,
    provider,
    plan: product.accessPlan,
    packageId: product.id,
    email: email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email.toLowerCase().trim() : null,
    mock: isMock,
  }
}

