import type { PackageId } from '@/lib/packages'
import { isWeekendSaleActive } from '@/lib/weekend-sale'

export type TemplateCheckoutInput = {
  slug: string
  isFree?: boolean
  pricingTier?: string | null
  price?: number | null
}

export function getStandardTemplateCheckoutPackageId(template: TemplateCheckoutInput): PackageId {
  if (template.isFree) return 'free-unlock'
  const priceUsd = Number(template.price || 0)
  if (priceUsd >= 52) return 'ooster-pro'
  if (priceUsd >= 20 || template.pricingTier === 'pro') return 'pro'
  return 'next'
}

export function getTemplateCheckoutPackageId(template: TemplateCheckoutInput): PackageId {
  if (!template.isFree && isWeekendSaleActive()) return 'weekend-template'
  return getStandardTemplateCheckoutPackageId(template)
}
