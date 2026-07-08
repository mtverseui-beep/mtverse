import type { PackageId } from '@/lib/packages'

export type TemplateCheckoutInput = {
  slug: string
  isFree?: boolean
  pricingTier?: string | null
}

const PREMIUM_PRO_TEMPLATE_SLUGS = new Set([
  'ooster',
  'nova-rig-gaming-ecommerce-template',
  'volthaus-streetwear-ecommerce-template',
])

export function getTemplateCheckoutPackageId(template: TemplateCheckoutInput): PackageId {
  if (template.isFree) return 'free-unlock'
  if (PREMIUM_PRO_TEMPLATE_SLUGS.has(template.slug)) return 'ooster-pro'
  return template.pricingTier === 'pro' ? 'pro' : 'next'
}