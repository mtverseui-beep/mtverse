import type { PlanLevel } from './plan-access'

export const PACKAGE_IDS = [
  'next',
  'pro',
  'ooster-pro',
  'free-unlock',
  'all-paid',
  'ui-library',
  'mtadmin-nextjs',
  'mtadmin-react',
  'mtadmin-bundle',
  'weekend-template',
  'weekend-mtadmin-nextjs',
  'weekend-mtadmin-react',
  'offer-ui-library',
  'offer-all-paid',
] as const

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
  'ooster-pro': {
    id: 'ooster-pro',
    name: 'Premium Pro Template Package',
    shortName: 'Premium Pro',
    amountUsd: 52,
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
  'all-paid': {
    id: 'all-paid',
    name: 'All Paid Templates Bundle',
    shortName: 'All Paid Bundle',
    amountUsd: 149,
    currency: 'USD',
    accessPlan: 'pro',
  },
  'ui-library': {
    id: 'ui-library',
    name: 'mtverse UI Library Lifetime Access',
    shortName: 'UI Library',
    amountUsd: 25,
    currency: 'USD',
    accessPlan: 'pro',
  },
  'mtadmin-nextjs': {
    id: 'mtadmin-nextjs',
    name: 'mtadmin Next.js Admin Dashboard',
    shortName: 'mtadmin Next.js',
    amountUsd: 25,
    currency: 'USD',
    accessPlan: 'pro',
  },
  'mtadmin-react': {
    id: 'mtadmin-react',
    name: 'mtadmin React Admin Dashboard',
    shortName: 'mtadmin React',
    amountUsd: 25,
    currency: 'USD',
    accessPlan: 'pro',
  },
  'mtadmin-bundle': {
    id: 'mtadmin-bundle',
    name: 'mtadmin All Frameworks Bundle',
    shortName: 'mtadmin Bundle',
    amountUsd: 30,
    currency: 'USD',
    accessPlan: 'pro',
  },
  'weekend-template': {
    id: 'weekend-template',
    name: 'mtverse Weekend Template Offer',
    shortName: 'Weekend Template',
    amountUsd: 7,
    currency: 'USD',
    accessPlan: 'pro',
  },
  'weekend-mtadmin-nextjs': {
    id: 'weekend-mtadmin-nextjs',
    name: 'mtadmin Next.js Weekend Offer',
    shortName: 'mtadmin Next.js',
    amountUsd: 7,
    currency: 'USD',
    accessPlan: 'pro',
  },
  'weekend-mtadmin-react': {
    id: 'weekend-mtadmin-react',
    name: 'mtadmin React Weekend Offer',
    shortName: 'mtadmin React',
    amountUsd: 7,
    currency: 'USD',
    accessPlan: 'pro',
  },

  'offer-ui-library': {
    id: 'offer-ui-library',
    name: 'mtverse UI Library Weekly Offer',
    shortName: 'UI Library Offer',
    amountUsd: 7,
    currency: 'USD',
    accessPlan: 'pro',
  },
  'offer-all-paid': {
    id: 'offer-all-paid',
    name: 'All Paid Templates Weekly Offer',
    shortName: 'All Templates Offer',
    amountUsd: 50,
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
