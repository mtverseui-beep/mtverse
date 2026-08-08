export const TEMPLATE_SLUG_ALIASES: Readonly<Record<string, string>> = {
  'ooster-admin-dashboard-template': 'ooster',
  'ooster-dashboard-template': 'ooster',
  'mt-ooster-dxb4': 'ooster',
  'nova-ig-landing-page-template': 'nova-rig-gaming-ecommerce-template',
  'nova-ig-template': 'nova-rig-gaming-ecommerce-template',
  'mt-nova-ig': 'nova-rig-gaming-ecommerce-template',
  'lumina-landing-page-template': 'lumina-fragrance',
  'mt-lumina': 'lumina-fragrance',
  'pagepulse-landing-page-template': 'pagepulse',
  'mt-pagepulse0': 'pagepulse',
  'volthaus-landing-page-template': 'volthaus-streetwear-ecommerce-template',
  'mt-volthaus': 'volthaus-streetwear-ecommerce-template',
  'sentinelgrid-dashboard-template': 'sentinelgrid',
  'mt-sentinelgrid-zw5j': 'sentinelgrid',
  'planna-dashboard-template': 'planna-dashboard',
  'mt-planna-z3pv': 'planna-dashboard',
  'nexusgrid-admin-dashboard-template': 'nexusgrid-premium-admin-dashboard',
  'mt-nexusgrid': 'nexusgrid-premium-admin-dashboard',
}

export function resolveTemplateSlug(slug: string) {
  return TEMPLATE_SLUG_ALIASES[slug] || slug
}
