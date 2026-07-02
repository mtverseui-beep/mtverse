import type { PlanLevel } from './plan-access'

export const PACKAGE_IDS = ['next', 'pro', 'free-unlock'] as const

export type PackageId = (typeof PACKAGE_IDS)[number]

export type ProductPackage = {
  id: PackageId
  name: string
  shortName: string
  amountUsd: number
  currency: 'USD'
  accessPlan: PlanLevel
}

export const PRODUCT_PACKAGES: Record<PackageId, ProductPackage> = {
  next: {
    id: 'next',
    name: 'Next.js Dashboard Kit Package',
    shortName: 'Next.js Kit',
    amountUsd: 12,
    currency: 'USD',
    accessPlan: 'pro',
  },
  pro: {
    id: 'pro',
    name: 'Pro Dashboard Template Package',
    shortName: 'Pro Template',
    amountUsd: 20,
    currency: 'USD',
    accessPlan: 'pro',
  },
  'free-unlock': {
    id: 'free-unlock',
    name: 'All HTML Templates Bundle',
    shortName: 'HTML Bundle',
    amountUsd: 5,
    currency: 'USD',
    accessPlan: 'free',  // keeps account on free plan; unlock flag is handled separately
  },
}

export function isPackageId(value: unknown): value is PackageId {
  return typeof value === 'string' && PACKAGE_IDS.includes(value as PackageId)
}

export function getProductPackage(packageId: PackageId) {
  return PRODUCT_PACKAGES[packageId]
}
