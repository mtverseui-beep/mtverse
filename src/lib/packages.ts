import type { PlanLevel } from './plan-access'

export const PACKAGE_IDS = ['next'] as const

export type PackageId = (typeof PACKAGE_IDS)[number]

export type ProductPackage = {
  id: PackageId
  name: string
  shortName: string
  amountUsd: number
  currency: 'USD'
  accessPlan: Extract<PlanLevel, 'pro'>
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
}

export function isPackageId(value: unknown): value is PackageId {
  return typeof value === 'string' && PACKAGE_IDS.includes(value as PackageId)
}

export function getProductPackage(packageId: PackageId) {
  return PRODUCT_PACKAGES[packageId]
}
