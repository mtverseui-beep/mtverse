import type { PackageId } from '@/lib/packages'

export const WEEKEND_SALE = {
  id: 'mtverse-weekend-2026-08-01',
  name: 'mtverse Massive Weekend Offer',
  priceUsd: 7,
  startAt: '2026-08-01T00:00:00+05:30',
  endAt: '2026-08-03T00:00:00+05:30',
  timeZone: 'Asia/Kolkata',
  endLabel: 'Sunday, 11:59 PM IST',
} as const

export type WeekendSalePhase = 'upcoming' | 'active' | 'ended'

export const WEEKEND_SALE_PACKAGE_IDS = [
  'weekend-template',
  'weekend-mtadmin-nextjs',
  'weekend-mtadmin-react',
  'offer-ui-library',
  'offer-all-paid',
] as const satisfies readonly PackageId[]

type PriceableTemplate = {
  isFree?: boolean
  price: number
  originalPriceUsd?: number
  activeOffer?: unknown
}

function toTimestamp(value: number | Date) {
  return value instanceof Date ? value.getTime() : value
}

export function getWeekendSalePhase(now: number | Date = Date.now()): WeekendSalePhase {
  const timestamp = toTimestamp(now)
  const start = new Date(WEEKEND_SALE.startAt).getTime()
  const end = new Date(WEEKEND_SALE.endAt).getTime()

  if (timestamp < start) return 'upcoming'
  if (timestamp >= end) return 'ended'
  return 'active'
}

export function isWeekendSaleActive(now: number | Date = Date.now()) {
  return getWeekendSalePhase(now) === 'active'
}

export function getWeekendSaleRemainingMs(now: number | Date = Date.now()) {
  return Math.max(0, new Date(WEEKEND_SALE.endAt).getTime() - toTimestamp(now))
}

export function applyWeekendTemplateOffer<T extends PriceableTemplate>(
  template: T,
  now: number | Date = Date.now(),
): T {
  if (
    !isWeekendSaleActive(now) ||
    template.isFree ||
    template.price <= WEEKEND_SALE.priceUsd
  ) {
    return template
  }

  return {
    ...template,
    originalPriceUsd: template.price,
    price: WEEKEND_SALE.priceUsd,
  }
}

export function hasWeekendTemplateOffer(template: PriceableTemplate) {
  return Boolean(
    !template.isFree &&
    template.activeOffer &&
    typeof template.originalPriceUsd === 'number' &&
    template.originalPriceUsd > template.price
  )
}

export function isWeekendSalePackageId(packageId: PackageId) {
  return WEEKEND_SALE_PACKAGE_IDS.includes(packageId as (typeof WEEKEND_SALE_PACKAGE_IDS)[number])
}

export function getWeekendMtadminPackageId(packageId: PackageId): PackageId {
  if (packageId === 'mtadmin-nextjs') return 'weekend-mtadmin-nextjs'
  if (packageId === 'mtadmin-react') return 'weekend-mtadmin-react'
  return packageId
}

export function getStandardEntitlementPackageId(packageId: PackageId): PackageId {
  if (packageId === 'weekend-mtadmin-nextjs') return 'mtadmin-nextjs'
  if (packageId === 'weekend-mtadmin-react') return 'mtadmin-react'
  if (packageId === 'offer-ui-library') return 'ui-library'
  if (packageId === 'offer-all-paid') return 'all-paid'
  return packageId
}
