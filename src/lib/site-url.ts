const FALLBACK_SITE_URL = 'https://mtverse.dev'

function normalizeSiteUrl(value: string | undefined) {
  const trimmed = value?.trim()
  if (!trimmed) return ''
  return trimmed.replace(/\/+$/, '')
}

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) || FALLBACK_SITE_URL

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
