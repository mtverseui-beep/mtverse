const ADSENSE_DIRECT_CERTIFICATION_ID = 'f08c47fec0942fa0'
const ADSENSE_CLIENT_PATTERN = /^ca-pub-\d{16}$/
const ADSENSE_PUBLISHER_PATTERN = /^pub-\d{16}$/

function readEnv(value?: string) {
  return value?.trim() || ''
}

function normalizeAdsenseClient(value?: string) {
  const configured = readEnv(value)

  if (ADSENSE_CLIENT_PATTERN.test(configured)) return configured
  if (ADSENSE_PUBLISHER_PATTERN.test(configured)) return `ca-${configured}`

  return ''
}

export function getGoogleAdsenseClient() {
  return normalizeAdsenseClient(process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT)
}

export function getGoogleAdsensePublisherId() {
  const client = getGoogleAdsenseClient()
  return client.startsWith('ca-') ? client.slice(3) : ''
}

export function isGoogleAdsenseConfigured() {
  return Boolean(getGoogleAdsenseClient())
}

export function isGoogleAdsenseEnabled() {
  return process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ENABLED === 'true' && isGoogleAdsenseConfigured()
}

/** Sidebar/listing ad slot */
export function getAdSlotSidebar() {
  return readEnv(process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR)
}

/** In-content/inline ad slot */
export function getAdSlotInline() {
  return readEnv(process.env.NEXT_PUBLIC_ADSENSE_SLOT_INLINE)
}

/** Footer/bottom ad slot */
export function getAdSlotFooter() {
  return readEnv(process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER)
}

const ALLOWED_AD_PATTERNS = [
  /^\/$/,
  /^\/blog$/,
  /^\/blog\//,
  /^\/prompts$/,
  /^\/prompts\//,
  /^\/templates$/,
  /^\/templates\//,
]

const DISALLOWED_AD_PATTERNS = [
  /^\/admin/,
  /^\/admin-login/,
  /^\/api\//,
  /^\/account/,
  /^\/sign-in/,
  /^\/sign-up/,
  /^\/forgot-password/,
  /^\/reset-password/,
  /^\/pricing/,
  /^\/privacy/,
  /^\/terms/,
  /^\/cookie-policy/,
  /^\/disclaimer/,
  /^\/dmca/,
  /^\/refund-policy/,
  /^\/license/,
  /^\/contact/,
  /^\/support/,
  /^\/feedback/,
  /^\/search/,
  /^\/ui\/source/,
]

export function isAdsenseAllowedOnPath(pathname: string): boolean {
  if (!isGoogleAdsenseEnabled()) return false

  for (const pattern of DISALLOWED_AD_PATTERNS) {
    if (pattern.test(pathname)) return false
  }

  for (const pattern of ALLOWED_AD_PATTERNS) {
    if (pattern.test(pathname)) return true
  }

  return false
}

export const AD_RESERVE_SIZES = {
  sidebar: { width: 300, height: 250 },
  inline: { width: 728, height: 90 },
  footer: { width: 728, height: 90 },
  auto: { width: '100%', height: 120 },
} as const

export function getGoogleAdsTxtLine() {
  const publisherId = getGoogleAdsensePublisherId()
  if (!publisherId) return ''

  return `google.com, ${publisherId}, DIRECT, ${ADSENSE_DIRECT_CERTIFICATION_ID}`
}