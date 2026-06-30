import type { PackageId } from '@/lib/packages'

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
