// ─────────────────────────────────────────────────────────
// Centralized Site URL Configuration
// ─────────────────────────────────────────────────────────
// Priority:
//   1. NEXT_PUBLIC_SITE_URL env var (preferred)
//   2. VERCEL_URL env var (for Vercel deployments)
//   3. Fallback to https://mtverse.dev

const FALLBACK_SITE_URL = 'https://mtverse.dev'

function normalizeSiteUrl(value: string | undefined) {
  const trimmed = value?.trim()
  if (!trimmed) return ''
  return trimmed.replace(/\/+$/, '')
}

function resolveSiteUrl(): string {
  // 1. Explicit site URL from environment
  const explicit = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL)
  if (explicit) return explicit

  // 2. Vercel deployment URL
  const vercelUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_VERCEL_URL || process.env.VERCEL_URL)
  if (vercelUrl) {
    // Vercel URLs don't include the protocol
    if (vercelUrl.startsWith('http://') || vercelUrl.startsWith('https://')) return vercelUrl
    return `https://${vercelUrl}`
  }

  // 3. Fallback
  return FALLBACK_SITE_URL
}

export const SITE_URL = resolveSiteUrl()

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
